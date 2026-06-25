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
import {
  PERSISTENCE_NOT_CREATED,
  PERSISTENCE_NOT_FOUND,
  PERSISTENCE_NOT_REMOVED,
  PERSISTENCE_NOT_UPDATED,
} from "../persistence.messages";
import { FindManyQuery, FindOneQuery } from "../types/input.type";
import type { BatchCount, MultiPaged } from "../types/output.type";

export class CrudRepository<TModel, TEntity> {
  constructor(
    readonly model: Model<TModel>,
    private readonly toEntity: (model: TModel) => TEntity
  ) {}

  private toFilter(filters?: QueryFilter<TModel>): QueryFilter<TModel> {
    return clearObject(filters) as QueryFilter<TModel>;
  }

  private toLimit(limit?: number): number {
    return Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  }

  async findOneById(id: string): Promise<TEntity> {
    assertValidObjectId(id);

    const document = await this.model.findById(id).exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    return this.toEntity(document);
  }

  async findManyById(ids: string[]): Promise<TEntity[]> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return [];

    const documents = await this.model
      .find({ _id: { $in: ids } } as QueryFilter<TModel>)
      .limit(ids.length)
      .exec();

    return documents.map((document) => this.toEntity(document));
  }

  async findOne({ filters }: FindOneQuery<TModel>): Promise<TEntity> {
    const document = await this.model.findOne(this.toFilter(filters)).exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    return this.toEntity(document);
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = DEFAULT_PAGE_SIZE,
  }: FindManyQuery<TModel>): Promise<MultiPaged<TEntity>> {
    const clearedFilters = this.toFilter(filters);
    const safeLimit = this.toLimit(limit);

    const [documents, found] = await Promise.all([
      this.model
        .find(clearedFilters)
        .sort(clearObject(sort) as Record<keyof TModel, SortOrder>)
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      this.model.countDocuments(clearedFilters).exec(),
    ]);

    return mapPage({ nodes: documents, found }, (document) =>
      this.toEntity(document)
    );
  }

  async createOne(createInput: AnyKeys<TModel>): Promise<TEntity> {
    const document = await this.model.create(createInput);
    if (isNil(document)) throw new BadRequestException(PERSISTENCE_NOT_CREATED);
    return this.toEntity(document);
  }

  async createMany(createInputs: AnyKeys<TModel>[]): Promise<BatchCount> {
    if (createInputs.length === 0) return { succeeded: 0, failed: 0 };

    const documents = await this.model.create(createInputs);
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

  async updateOneById(
    id: string,
    updateInput: UpdateQuery<TModel>
  ): Promise<TEntity> {
    assertValidObjectId(id);

    const document = await this.model
      .findByIdAndUpdate(id, updateInput, {
        returnDocument: "after",
        runValidators: true,
      })
      .exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_UPDATED);
    return this.toEntity(document);
  }

  async updateManyById(
    ids: string[],
    updateInput: UpdateQuery<TModel>
  ): Promise<BatchCount> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    const result = await this.model
      .updateMany({ _id: { $in: ids } } as QueryFilter<TModel>, updateInput, {
        runValidators: true,
      })
      .exec();

    return assertBatchSucceeded(
      {
        succeeded: result.matchedCount,
        failed: ids.length - result.matchedCount,
      },
      new NotFoundException(PERSISTENCE_NOT_UPDATED)
    );
  }

  async updateOne(
    { filters }: FindOneQuery<TModel>,
    updateInput: UpdateQuery<TModel>
  ): Promise<TEntity> {
    const document = await this.model
      .findOneAndUpdate(this.toFilter(filters), updateInput, {
        returnDocument: "after",
        runValidators: true,
      })
      .exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_UPDATED);
    return this.toEntity(document);
  }

  async updateMany(
    filter: QueryFilter<TModel>,
    update: UpdateQuery<TModel>,
    options?: { arrayFilters?: Record<string, unknown>[] }
  ): Promise<BatchCount> {
    const result = await this.model
      .updateMany(this.toFilter(filter), update, {
        ...options,
        runValidators: true,
      })
      .exec();

    return assertBatchSucceeded(
      { succeeded: result.matchedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_UPDATED)
    );
  }

  async deleteOneById(id: string): Promise<TEntity> {
    assertValidObjectId(id);

    const document = await this.model.findByIdAndDelete(id).exec();
    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_REMOVED);
    return this.toEntity(document);
  }

  async deleteManyById(ids: string[]): Promise<BatchCount> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    const result = await this.model
      .deleteMany({ _id: { $in: ids } } as QueryFilter<TModel>)
      .exec();

    return assertBatchSucceeded(
      {
        succeeded: result.deletedCount,
        failed: ids.length - result.deletedCount,
      },
      new NotFoundException(PERSISTENCE_NOT_REMOVED)
    );
  }

  async deleteOne({ filters }: FindOneQuery<TModel>): Promise<TEntity> {
    const document = await this.model
      .findOneAndDelete(this.toFilter(filters))
      .exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_REMOVED);
    return this.toEntity(document);
  }

  async deleteMany(filter: QueryFilter<TModel>): Promise<BatchCount> {
    const result = await this.model.deleteMany(this.toFilter(filter)).exec();

    return assertBatchSucceeded(
      { succeeded: result.deletedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_REMOVED)
    );
  }
}
