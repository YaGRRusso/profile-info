import { BadRequestException, NotFoundException } from "@nestjs/common";
import { isNil } from "lodash";
import {
  type AnyKeys,
  type Model,
  type QueryFilter,
  type SortOrder,
} from "mongoose";
import { mapPage } from "@/common/helpers/map-page.helper";
import { clearObject } from "@/common/helpers/object.helper";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../consts/limits.const";
import { assertBatchSucceeded } from "../helpers/batch.helper";
import { withTenantScope } from "../helpers/tenant-scope.helper";
import {
  PERSISTENCE_NOT_CREATED,
  PERSISTENCE_NOT_FOUND,
  PERSISTENCE_NOT_REMOVED,
  PERSISTENCE_NOT_UPDATED,
} from "../persistence.messages";
import type { FindManyQuery, FindOneQuery } from "../types/input.type";
import type { TenantScope } from "../types/scope.type";
import type {
  CrudMapperInterface,
  CrudRepositoryInterface,
} from "./crud.interface";

export class CrudRepository<TModel, TEntity>
  implements CrudRepositoryInterface<TModel, TEntity>
{
  constructor(
    protected readonly model: Model<TModel>,
    protected readonly mapper: CrudMapperInterface<TEntity, TModel>,
    protected readonly currentScope?: TenantScope
  ) {}

  scoped(scope: TenantScope) {
    return new CrudRepository(this.model, this.mapper, scope);
  }

  global() {
    return new CrudRepository(this.model, this.mapper, undefined);
  }

  // --- scope ---

  private applyScope(filters?: QueryFilter<TModel>): QueryFilter<TModel> {
    const cleanFilters = clearObject(filters) as QueryFilter<TModel>;
    if (!this.currentScope || this.currentScope.crossTenant)
      return cleanFilters;
    return withTenantScope<TModel>(this.currentScope, cleanFilters);
  }

  private injectOwner(payload: AnyKeys<TModel>): AnyKeys<TModel> {
    if (!this.currentScope) return payload;
    const { ownerId: _, ...rest } = payload as AnyKeys<TModel> & {
      ownerId?: string;
    };
    return { ...rest, ownerId: this.currentScope.userId } as AnyKeys<TModel>;
  }

  private toLimit(limit?: number): number {
    return Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  }

  // --- read ---

  async findOne(query: FindOneQuery<TModel>) {
    const { filters } = query;
    const document = await this.model.findOne(this.applyScope(filters)).exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    return await this.mapper.toDomain(document);
  }

  async findMany(query: FindManyQuery<TModel>) {
    const { filters, sort, skip = 0, limit = DEFAULT_PAGE_SIZE } = query;
    const scopedFilters = this.applyScope(filters);
    const safeLimit = this.toLimit(limit);

    const [documents, found] = await Promise.all([
      this.model
        .find(scopedFilters)
        .sort(clearObject(sort) as Record<keyof TModel, SortOrder>)
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      this.model.countDocuments(scopedFilters).exec(),
    ]);

    return mapPage({ nodes: documents, found }, (document) =>
      this.mapper.toDomain(document)
    );
  }

  async findOneById(id: string) {
    assertValidObjectId(id);
    return await this.findOne({ filters: { _id: id } as QueryFilter<TModel> });
  }

  async findManyById(ids: string[]) {
    assertValidObjectIds(ids);
    if (ids.length === 0) return [];

    const { nodes } = await this.findMany({
      filters: { _id: { $in: ids } } as QueryFilter<TModel>,
      limit: ids.length,
    });
    return nodes;
  }

  // --- create ---

  async createOne(createInput: Partial<TEntity>) {
    const payload = this.injectOwner(
      this.mapper.toPersistenceForCreate(createInput)
    );
    const document = await this.model.create(payload);
    if (isNil(document)) throw new BadRequestException(PERSISTENCE_NOT_CREATED);
    return await this.mapper.toDomain(document);
  }

  async createMany(createInputs: Partial<TEntity>[]) {
    if (createInputs.length === 0) return { succeeded: 0, failed: 0 };

    const payloads = createInputs.map((input) =>
      this.injectOwner(this.mapper.toPersistenceForCreate(input))
    );
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

  async updateOne(query: FindOneQuery<TModel>, updateInput: Partial<TEntity>) {
    const { filters } = query;
    const document = await this.model
      .findOneAndUpdate(
        this.applyScope(filters),
        this.mapper.toPersistenceForUpdate(updateInput),
        {
          returnDocument: "after",
          runValidators: true,
        }
      )
      .exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_UPDATED);
    return await this.mapper.toDomain(document);
  }

  async updateMany(
    filter: QueryFilter<TModel>,
    updateInput: Partial<TEntity>,
    options?: { arrayFilters?: Record<string, unknown>[] }
  ) {
    const result = await this.model
      .updateMany(
        this.applyScope(filter),
        this.mapper.toPersistenceForUpdate(updateInput),
        {
          ...options,
          runValidators: true,
        }
      )
      .exec();

    return assertBatchSucceeded(
      { succeeded: result.matchedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_UPDATED)
    );
  }

  async updateOneById(id: string, updateInput: Partial<TEntity>) {
    assertValidObjectId(id);
    return await this.updateOne(
      { filters: { _id: id } as QueryFilter<TModel> },
      updateInput
    );
  }

  async updateManyById(ids: string[], updateInput: Partial<TEntity>) {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    const result = await this.updateMany(
      { _id: { $in: ids } } as QueryFilter<TModel>,
      updateInput
    );
    return {
      succeeded: result.succeeded,
      failed: ids.length - result.succeeded,
    };
  }

  // --- delete ---

  async deleteOne(query: FindOneQuery<TModel>) {
    const { filters } = query;
    const document = await this.model
      .findOneAndDelete(this.applyScope(filters))
      .exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_REMOVED);
    return await this.mapper.toDomain(document);
  }

  async deleteMany(filter: QueryFilter<TModel>) {
    const result = await this.model.deleteMany(this.applyScope(filter)).exec();
    return assertBatchSucceeded(
      { succeeded: result.deletedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_REMOVED)
    );
  }

  async deleteOneById(id: string) {
    assertValidObjectId(id);
    return await this.deleteOne({
      filters: { _id: id } as QueryFilter<TModel>,
    });
  }

  async deleteManyById(ids: string[]) {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    const result = await this.deleteMany({
      _id: { $in: ids },
    } as QueryFilter<TModel>);
    return {
      succeeded: result.succeeded,
      failed: ids.length - result.succeeded,
    };
  }
}
