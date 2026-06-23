import { BadRequestException, NotFoundException } from "@nestjs/common";
import { isNil } from "lodash";
import {
  type AnyKeys,
  type Model,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
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
import type {
  BatchCount,
  Multi,
  MultiPaged,
  Single,
} from "../types/output.type";

export class CrudRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  protected toFilter(filters?: QueryFilter<T>): QueryFilter<T> {
    return clearObject(filters) as QueryFilter<T>;
  }

  protected toLimit(limit?: number): number {
    return Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  }

  // Find by Id (One/Many)

  async findOneById(id: string): Promise<Single<T>> {
    assertValidObjectId(id);

    const res = await this.model.findById(id).exec();
    if (isNil(res)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    return res;
  }

  async findManyById(ids: string[]): Promise<Multi<T>> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return [];

    return await this.model
      .find({ _id: { $in: ids } } as QueryFilter<T>)
      .limit(ids.length)
      .exec();
  }

  // Find by Filter (One/Many)

  async findOne({ filters }: FindOneQuery<T>): Promise<Single<T>> {
    const clearedFilters = this.toFilter(filters);

    const res = await this.model.findOne(clearedFilters).exec();
    if (isNil(res)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = DEFAULT_PAGE_SIZE,
  }: FindManyQuery<T>): Promise<MultiPaged<T>> {
    const clearedFilters = this.toFilter(filters);
    const safeLimit = this.toLimit(limit);

    const [nodes, found] = await Promise.all([
      this.model
        .find(clearedFilters)
        .sort(clearObject(sort) as Record<keyof T, SortOrder>)
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      this.model.countDocuments(clearedFilters).exec(),
    ]);

    return { nodes, found };
  }

  // Create (One/Many)

  async createOne(createInput: AnyKeys<T>): Promise<Single<T>> {
    const res = await this.model.create(createInput);
    if (isNil(res)) throw new BadRequestException(PERSISTENCE_NOT_CREATED);
    return res;
  }

  async createMany(createInputs: AnyKeys<T>[]): Promise<BatchCount> {
    if (createInputs.length === 0) return { succeeded: 0, failed: 0 };

    const res = await this.model.create(createInputs);
    if (isNil(res)) throw new BadRequestException(PERSISTENCE_NOT_CREATED);

    return assertBatchSucceeded(
      {
        succeeded: res.length,
        failed: createInputs.length - res.length,
      },
      new BadRequestException(PERSISTENCE_NOT_CREATED)
    );
  }

  // Update by Id (One/Many)

  async updateOneById(
    id: string,
    updateInput: UpdateQuery<T>
  ): Promise<Single<T>> {
    assertValidObjectId(id);

    const res = await this.model
      .findByIdAndUpdate(id, updateInput, { new: true, runValidators: true })
      .exec();

    if (isNil(res)) throw new NotFoundException(PERSISTENCE_NOT_UPDATED);
    return res;
  }

  async updateManyById(
    ids: string[],
    updateInput: UpdateQuery<T>
  ): Promise<BatchCount> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    const res = await this.model
      .updateMany({ _id: { $in: ids } } as QueryFilter<T>, updateInput, {
        runValidators: true,
      })
      .exec();

    return assertBatchSucceeded(
      {
        succeeded: res.matchedCount,
        failed: ids.length - res.matchedCount,
      },
      new NotFoundException(PERSISTENCE_NOT_UPDATED)
    );
  }

  // Update by Filter (One/Many)

  async updateOne(
    { filters }: FindOneQuery<T>,
    updateInput: UpdateQuery<T>
  ): Promise<Single<T>> {
    const clearedFilters = this.toFilter(filters);

    const res = await this.model
      .findOneAndUpdate(clearedFilters, updateInput, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (isNil(res)) throw new NotFoundException(PERSISTENCE_NOT_UPDATED);
    return res;
  }

  async updateMany(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: { arrayFilters?: Record<string, unknown>[] }
  ): Promise<BatchCount> {
    const clearedFilters = this.toFilter(filter);

    const res = await this.model
      .updateMany(clearedFilters, update, {
        ...options,
        ...{ new: true, runValidators: true },
      })
      .exec();

    return assertBatchSucceeded(
      { succeeded: res.matchedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_UPDATED)
    );
  }

  // Delete by Id (One/Many)

  async deleteOneById(id: string): Promise<Single<T>> {
    assertValidObjectId(id);

    const res = await this.model.findByIdAndDelete(id).exec();
    if (isNil(res)) throw new NotFoundException(PERSISTENCE_NOT_REMOVED);
    return res;
  }

  async deleteManyById(ids: string[]): Promise<BatchCount> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    const res = await this.model
      .deleteMany({ _id: { $in: ids } } as QueryFilter<T>)
      .exec();

    return assertBatchSucceeded(
      {
        succeeded: res.deletedCount,
        failed: ids.length - res.deletedCount,
      },
      new NotFoundException(PERSISTENCE_NOT_REMOVED)
    );
  }

  // Delete by Filter (One/Many)

  async deleteOne({ filters }: FindOneQuery<T>): Promise<Single<T>> {
    const res = await this.model
      .findOneAndDelete(this.toFilter(filters))
      .exec();
    if (isNil(res)) throw new NotFoundException(PERSISTENCE_NOT_REMOVED);
    return res;
  }

  async deleteMany(filter: QueryFilter<T>): Promise<BatchCount> {
    const clearedFilters = this.toFilter(filter);
    const res = await this.model.deleteMany(clearedFilters).exec();
    return assertBatchSucceeded(
      { succeeded: res.deletedCount, failed: 0 },
      new NotFoundException(PERSISTENCE_NOT_REMOVED)
    );
  }
}
