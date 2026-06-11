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
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";

export class MongooseCrudRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async findOneById(id: string): Promise<T> {
    assertValidObjectId(id);

    const res = await this.model.findById(id).exec();
    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({ filters }: { filters?: QueryFilter<T> }): Promise<T> {
    const res = await this.model
      .findOne(clearObject(filters) as QueryFilter<T>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<T[]> {
    assertValidObjectIds(ids);

    const res = await this.model
      .find({ _id: { $in: ids } } as QueryFilter<T>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: QueryFilter<T>;
    sort?: Partial<Record<keyof T, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<T>> {
    const nodes = await this.model
      .find(clearObject(filters) as QueryFilter<T>)
      .sort(clearObject(sort) as Record<keyof T, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.model
      .countDocuments(clearObject(filters) as QueryFilter<T>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return { nodes, found };
  }

  async createOne(createInput: AnyKeys<T>): Promise<T> {
    const res = await this.model.create(createInput);
    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(createInputs: AnyKeys<T>[]): Promise<T[]> {
    const res = await this.model.create(createInputs);
    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(id: string, updateInput: UpdateQuery<T>): Promise<T> {
    assertValidObjectId(id);

    const res = await this.model
      .findByIdAndUpdate(id, updateInput, { new: true })
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateQuery<T>
  ): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const res = await this.model
      .updateMany({ _id: { $in: ids } } as QueryFilter<T>, updateInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async deleteOne(id: string): Promise<T> {
    assertValidObjectId(id);

    const res = await this.model.findByIdAndDelete(id).exec();
    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async deleteMany(ids: string[]): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const res = await this.model
      .deleteMany({ _id: { $in: ids } } as QueryFilter<T>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }

  async updateManyByFilter(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: { arrayFilters?: Record<string, unknown>[] }
  ): Promise<void> {
    await this.model
      .updateMany(clearObject(filter) as QueryFilter<T>, update, options)
      .exec();
  }

  async deleteManyByFilter(filter: QueryFilter<T>): Promise<void> {
    await this.model.deleteMany(clearObject(filter) as QueryFilter<T>).exec();
  }

  async count(): Promise<number> {
    return await this.model.countDocuments().exec();
  }

  async countByField(
    field: string
  ): Promise<{ label: string; value: number }[]> {
    const rows = await this.model.aggregate<{ _id: string; value: number }>([
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);
    return rows.map((row) => ({ label: row._id, value: row.value }));
  }

  async findRecentlyUpdated(
    limit: number,
    projection: string
  ): Promise<Array<Record<string, unknown> & { updatedAt: Date }>> {
    const rows = await this.model
      .find()
      .sort({ updatedAt: -1 as SortOrder })
      .limit(limit)
      .select(projection)
      .lean()
      .exec();

    return rows as unknown as Array<
      Record<string, unknown> & { updatedAt: Date }
    >;
  }
}
