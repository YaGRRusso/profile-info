import { BadRequestException, NotFoundException } from "@nestjs/common";
import { isNil } from "lodash";
import {
  type AnyKeys,
  type Model,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import { mapPage } from "@/common/helpers/map-page.helper";
import { clearObject } from "@/common/helpers/object.helper";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../consts/limits.const";
import { assertBatchSucceeded } from "../../helpers/batch.helper";
import {
  noopScope,
  resolvePersistenceScope,
} from "../../helpers/persistence-scope.helper";
import {
  PERSISTENCE_NOT_CREATED,
  PERSISTENCE_NOT_FOUND,
  PERSISTENCE_NOT_REMOVED,
  PERSISTENCE_NOT_UPDATED,
} from "../../persistence.messages";
import type { FindManyQuery, FindOneQuery } from "../../types/input.type";
import type { PersistenceScope, TenantScope } from "../../types/scope.type";
import type {
  CrudMapperInterface,
  CrudRepositoryInterface,
} from "./crud.interface";

export class CrudRepository<
  TModel,
  TEntity,
  TCreate = Partial<TEntity>,
  TUpdate = Partial<TEntity>,
  TFilter extends object = Partial<TEntity>,
  TSort extends object = Partial<TEntity>,
> implements
    CrudRepositoryInterface<TModel, TEntity, TCreate, TUpdate, TFilter, TSort>
{
  constructor(
    protected readonly model: Model<TModel>,
    protected readonly mapper: CrudMapperInterface<
      TEntity,
      TModel,
      TCreate,
      TUpdate,
      TFilter,
      TSort
    >,
    protected readonly currentScope?: PersistenceScope
  ) {}

  scoped(scope: PersistenceScope | TenantScope) {
    return new CrudRepository(
      this.model,
      this.mapper,
      resolvePersistenceScope(scope)
    );
  }

  global() {
    return new CrudRepository(this.model, this.mapper, noopScope());
  }

  // --- scope ---

  private cleanFilter(filters?: QueryFilter<TModel>): QueryFilter<TModel> {
    return clearObject(filters) as QueryFilter<TModel>;
  }

  private applyReadFilter(filters?: QueryFilter<TModel>): QueryFilter<TModel> {
    const clean = this.cleanFilter(filters);
    return this.currentScope?.query.forRead(clean) ?? clean;
  }

  private applyMutateFilter(
    filters?: QueryFilter<TModel>
  ): QueryFilter<TModel> {
    const clean = this.cleanFilter(filters);
    return this.currentScope?.query.forMutate(clean) ?? clean;
  }

  private applyCreatePayload(payload: AnyKeys<TModel>): AnyKeys<TModel> {
    return this.currentScope?.document.forCreate(payload) ?? payload;
  }

  private applyUpdatePayload(
    payload: UpdateQuery<TModel>
  ): UpdateQuery<TModel> {
    return this.currentScope?.document.forUpdate(payload) ?? payload;
  }

  private resolveLimit(limit?: number): number {
    return Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  }

  private resolveFilter(filters?: TFilter): QueryFilter<TModel> | undefined {
    const value = clearObject(filters);
    if (!value) return;

    return this.mapper.toPersistenceForFilter(value);
  }

  private resolveSort(
    sort?: TSort
  ): Record<keyof TModel, SortOrder> | undefined {
    const value = clearObject(sort);
    if (!value) return;

    return this.mapper.toPersistenceForSort(value);
  }

  // --- read ---

  async findOne(query: FindOneQuery<TFilter>) {
    const { filters } = query;
    const resolvedFilter = this.resolveFilter(filters);
    const scopedFilter = this.applyReadFilter(resolvedFilter);

    const document = await this.model.findOne(scopedFilter).exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    return await this.mapper.toDomain(document);
  }

  async findMany(query: FindManyQuery<TFilter, TSort>) {
    const { filters, sort, skip = 0, limit = DEFAULT_PAGE_SIZE } = query;
    const resolvedFilter = this.resolveFilter(filters);
    const scopedFilter = this.applyReadFilter(resolvedFilter);
    const resolvedSort = this.resolveSort(sort);
    const resolvedLimit = this.resolveLimit(limit);

    const [documents, found] = await Promise.all([
      this.model
        .find(scopedFilter)
        .sort(resolvedSort)
        .skip(skip)
        .limit(resolvedLimit)
        .exec(),
      this.model.countDocuments(scopedFilter).exec(),
    ]);

    return mapPage({ nodes: documents, found }, (document) =>
      this.mapper.toDomain(document)
    );
  }

  async findOneById(id: string) {
    assertValidObjectId(id);
    const resolvedFilter = { _id: id } as QueryFilter<TModel>;
    const scopedFilter = this.applyReadFilter(resolvedFilter);

    const document = await this.model.findOne(scopedFilter).exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    return await this.mapper.toDomain(document);
  }

  async findManyById(ids: string[]) {
    assertValidObjectIds(ids);
    if (ids.length === 0) return [];

    const resolvedFilter = { _id: { $in: ids } } as QueryFilter<TModel>;
    const scopedFilter = this.applyReadFilter(resolvedFilter);

    const documents = await this.model
      .find(scopedFilter)
      .limit(ids.length)
      .exec();

    return Promise.all(
      documents.map((document) => this.mapper.toDomain(document))
    );
  }

  // --- create ---

  async createOne(createInput: TCreate) {
    const mapped = this.mapper.toPersistenceForCreate(createInput);
    const payload = this.applyCreatePayload(mapped);
    const document = await this.model.create(payload);
    if (isNil(document)) throw new BadRequestException(PERSISTENCE_NOT_CREATED);
    return await this.mapper.toDomain(document);
  }

  async createMany(createInputs: TCreate[]) {
    if (createInputs.length === 0) return { succeeded: 0, failed: 0 };

    const payloads = createInputs.map((input) => {
      const mapped = this.mapper.toPersistenceForCreate(input);
      return this.applyCreatePayload(mapped);
    });
    const documents = await this.model.create(payloads);
    if (isNil(documents))
      throw new BadRequestException(PERSISTENCE_NOT_CREATED);

    return assertBatchSucceeded(
      {
        succeeded: documents.length,
        failed: createInputs.length - documents.length,
      },
      new BadRequestException(PERSISTENCE_NOT_CREATED)
    );
  }

  // --- update ---

  async updateOne(query: FindOneQuery<TFilter>, updateInput: TUpdate) {
    const { filters } = query;
    const resolvedFilter = this.resolveFilter(filters);
    const scopedFilter = this.applyMutateFilter(resolvedFilter);

    const mapped = this.mapper.toPersistenceForUpdate(updateInput);
    const payload = this.applyUpdatePayload(mapped);

    const document = await this.model
      .findOneAndUpdate(scopedFilter, payload, {
        returnDocument: "after",
        runValidators: true,
      })
      .exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_UPDATED);
    return await this.mapper.toDomain(document);
  }

  async updateMany(
    filter: TFilter,
    updateInput: TUpdate,
    options?: { arrayFilters?: Record<string, unknown>[] }
  ) {
    const resolvedFilter = this.resolveFilter(filter);
    const scopedFilter = this.applyMutateFilter(resolvedFilter);

    const mapped = this.mapper.toPersistenceForUpdate(updateInput);
    const payload = this.applyUpdatePayload(mapped);

    const result = await this.model
      .updateMany(scopedFilter, payload, {
        ...options,
        runValidators: true,
      })
      .exec();

    return assertBatchSucceeded(
      { succeeded: result.matchedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_UPDATED)
    );
  }

  async updateOneById(id: string, updateInput: TUpdate) {
    assertValidObjectId(id);
    const resolvedFilter = { _id: id } as QueryFilter<TModel>;
    const scopedFilter = this.applyMutateFilter(resolvedFilter);

    const mapped = this.mapper.toPersistenceForUpdate(updateInput);
    const payload = this.applyUpdatePayload(mapped);

    const document = await this.model
      .findOneAndUpdate(scopedFilter, payload, {
        returnDocument: "after",
        runValidators: true,
      })
      .exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_UPDATED);
    return await this.mapper.toDomain(document);
  }

  async updateManyById(ids: string[], updateInput: TUpdate) {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    const resolvedFilter = { _id: { $in: ids } } as QueryFilter<TModel>;
    const scopedFilter = this.applyMutateFilter(resolvedFilter);

    const mapped = this.mapper.toPersistenceForUpdate(updateInput);
    const payload = this.applyUpdatePayload(mapped);

    const result = await this.model
      .updateMany(scopedFilter, payload, {
        runValidators: true,
      })
      .exec();

    const batch = assertBatchSucceeded(
      { succeeded: result.matchedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_UPDATED)
    );
    return {
      succeeded: batch.succeeded,
      failed: ids.length - batch.succeeded,
    };
  }

  // --- delete ---

  async deleteOne(query: FindOneQuery<TFilter>) {
    const { filters } = query;
    const resolvedFilter = this.resolveFilter(filters);
    const scopedFilter = this.applyMutateFilter(resolvedFilter);

    const document = await this.model.findOneAndDelete(scopedFilter).exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_REMOVED);
    return await this.mapper.toDomain(document);
  }

  async deleteMany(filter: TFilter) {
    const resolvedFilter = this.resolveFilter(filter);
    const scopedFilter = this.applyMutateFilter(resolvedFilter);

    const result = await this.model.deleteMany(scopedFilter).exec();
    return assertBatchSucceeded(
      { succeeded: result.deletedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_REMOVED)
    );
  }

  async deleteOneById(id: string) {
    assertValidObjectId(id);
    const resolvedFilter = { _id: id } as QueryFilter<TModel>;
    const scopedFilter = this.applyMutateFilter(resolvedFilter);

    const document = await this.model.findOneAndDelete(scopedFilter).exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_REMOVED);
    return await this.mapper.toDomain(document);
  }

  async deleteManyById(ids: string[]) {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    const resolvedFilter = { _id: { $in: ids } } as QueryFilter<TModel>;
    const scopedFilter = this.applyMutateFilter(resolvedFilter);

    const result = await this.model.deleteMany(scopedFilter).exec();

    const batch = assertBatchSucceeded(
      { succeeded: result.deletedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_REMOVED)
    );
    return {
      succeeded: batch.succeeded,
      failed: ids.length - batch.succeeded,
    };
  }
}
