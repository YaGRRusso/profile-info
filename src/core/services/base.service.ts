import { BadRequestException, NotFoundException } from "@nestjs/common";
import { isNil } from "lodash";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { clearObject } from "@/core/helpers/object.helper";

export abstract class BaseService<
  ModelType extends object,
  CreateType extends object,
  UpdateType extends object,
> {
  protected constructor(protected readonly model: Model<ModelType>) {}

  // QUERIES

  async findOneById(id: string): Promise<ModelType> {
    const res = await this.model.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<ModelType>;
  }): Promise<ModelType> {
    const res = await this.model
      .findOne(clearObject(filters) as QueryFilter<ModelType>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<ModelType[]> {
    const res = await this.model
      .find({ _id: { $in: ids } } as QueryFilter<ModelType>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: {
    filters?: QueryFilter<ModelType>;
    sort?: Partial<Record<keyof ModelType, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<ModelType[]> {
    const res = await this.model
      .find(clearObject(filters) as QueryFilter<ModelType>)
      .sort(clearObject(sort) as Record<keyof ModelType, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  // MUTATIONS

  async createOne(createInput: CreateType): Promise<ModelType> {
    const res = await this.model.create(createInput as AnyKeys<ModelType>);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(createInputs: CreateType[]): Promise<ModelType[]> {
    const res = await this.model.create(createInputs as AnyKeys<ModelType>[]);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(id: string, updateInput: UpdateType): Promise<ModelType> {
    const res = await this.model
      .findByIdAndUpdate(id, updateInput as object as UpdateQuery<ModelType>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateType
  ): Promise<BatchEntity> {
    const res = await this.model
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<ModelType>,
        updateInput as object as UpdateQuery<ModelType>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<ModelType> {
    const res = await this.model.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const res = await this.model
      .deleteMany({ _id: { $in: ids } } as QueryFilter<ModelType>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
