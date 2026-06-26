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
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../consts/limits.const";
import { assertBatchSucceeded } from "../helpers/batch.helper";
import { withTenantScope } from "../helpers/tenant-scope.helper";
import {
  PERSISTENCE_NOT_CREATED,
  PERSISTENCE_NOT_FOUND,
  PERSISTENCE_NOT_REMOVED,
  PERSISTENCE_NOT_UPDATED,
} from "../persistence.messages";
import { FindManyQuery, FindOneQuery } from "../types/input.type";
import type { BatchCount, MultiPaged } from "../types/output.type";
import type { TenantScope } from "../types/scope.type";

export class CrudRepository<TModel, TEntity> {
  constructor(
    protected readonly model: Model<TModel>,
    protected readonly toEntity: (model: TModel) => TEntity,
    protected readonly currentScope?: TenantScope
  ) {}

  scoped(scope: TenantScope): CrudRepository<TModel, TEntity> {
    return new CrudRepository(this.model, this.toEntity, scope);
  }

  global(): CrudRepository<TModel, TEntity> {
    return new CrudRepository(this.model, this.toEntity, undefined);
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

  async findOne({ filters }: FindOneQuery<TModel>): Promise<TEntity> {
    const document = await this.model.findOne(this.applyScope(filters)).exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    return await this.toEntity(document);
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = DEFAULT_PAGE_SIZE,
  }: FindManyQuery<TModel>): Promise<MultiPaged<TEntity>> {
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
      this.toEntity(document)
    );
  }

  async findOneById(id: string): Promise<TEntity> {
    assertValidObjectId(id);
    return await this.findOne({ filters: { _id: id } as QueryFilter<TModel> });
  }

  async findManyById(ids: string[]): Promise<TEntity[]> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return [];

    const { nodes } = await this.findMany({
      filters: { _id: { $in: ids } } as QueryFilter<TModel>,
      limit: ids.length,
    });
    return nodes;
  }

  // --- create ---

  async createOne(createInput: AnyKeys<TModel>): Promise<TEntity> {
    const document = await this.model.create(this.injectOwner(createInput));
    if (isNil(document)) throw new BadRequestException(PERSISTENCE_NOT_CREATED);
    return await this.toEntity(document);
  }

  async createMany(createInputs: AnyKeys<TModel>[]): Promise<BatchCount> {
    if (createInputs.length === 0) return { succeeded: 0, failed: 0 };

    const payloads = createInputs.map((input) => this.injectOwner(input));
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

  async updateOne(
    { filters }: FindOneQuery<TModel>,
    updateInput: UpdateQuery<TModel>
  ): Promise<TEntity> {
    const document = await this.model
      .findOneAndUpdate(this.applyScope(filters), updateInput, {
        returnDocument: "after",
        runValidators: true,
      })
      .exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_UPDATED);
    return await this.toEntity(document);
  }

  async updateMany(
    filter: QueryFilter<TModel>,
    update: UpdateQuery<TModel>,
    options?: { arrayFilters?: Record<string, unknown>[] }
  ): Promise<BatchCount> {
    const result = await this.model
      .updateMany(this.applyScope(filter), update, {
        ...options,
        runValidators: true,
      })
      .exec();

    return assertBatchSucceeded(
      { succeeded: result.matchedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_UPDATED)
    );
  }

  async updateOneById(
    id: string,
    updateInput: UpdateQuery<TModel>
  ): Promise<TEntity> {
    assertValidObjectId(id);
    return await this.updateOne(
      { filters: { _id: id } as QueryFilter<TModel> },
      updateInput
    );
  }

  async updateManyById(
    ids: string[],
    updateInput: UpdateQuery<TModel>
  ): Promise<BatchCount> {
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

  async deleteOne({ filters }: FindOneQuery<TModel>): Promise<TEntity> {
    const document = await this.model
      .findOneAndDelete(this.applyScope(filters))
      .exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_REMOVED);
    return await this.toEntity(document);
  }

  async deleteMany(filter: QueryFilter<TModel>): Promise<BatchCount> {
    const result = await this.model.deleteMany(this.applyScope(filter)).exec();
    return assertBatchSucceeded(
      { succeeded: result.deletedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_REMOVED)
    );
  }

  async deleteOneById(id: string): Promise<TEntity> {
    assertValidObjectId(id);
    return await this.deleteOne({
      filters: { _id: id } as QueryFilter<TModel>,
    });
  }

  async deleteManyById(ids: string[]): Promise<BatchCount> {
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
