import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import {
  AnyKeys,
  isValidObjectId,
  Model,
  QueryFilter,
  SortOrder,
  UpdateQuery,
} from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { clearObject } from "@/core/helpers/object.helper";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { SkillModel } from "@/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(SkillModel.name) readonly skillModel: Model<SkillModel>
  ) {}
  async findOneById(id: string): Promise<SkillModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.skillModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<SkillModel>;
  }): Promise<SkillModel> {
    const res = await this.skillModel
      .findOne(clearObject(filters) as QueryFilter<SkillModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<SkillModel[]> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.skillModel
      .find({ _id: { $in: ids } } as QueryFilter<SkillModel>)
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
    filters?: QueryFilter<SkillModel>;
    sort?: Partial<Record<keyof SkillModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<SkillModel>> {
    const nodes = await this.skillModel
      .find(clearObject(filters) as QueryFilter<SkillModel>)
      .sort(clearObject(sort) as Record<keyof SkillModel, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.skillModel
      .countDocuments(clearObject(filters) as QueryFilter<SkillModel>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return {
      nodes,
      found,
    };
  }

  async createOne(createInput: CreateSkillInput): Promise<SkillModel> {
    const res = await this.skillModel.create(
      createInput as AnyKeys<SkillModel>
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(createInputs: CreateSkillInput[]): Promise<SkillModel[]> {
    const res = await this.skillModel.create(
      createInputs as AnyKeys<SkillModel>[]
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateInput: UpdateSkillInput
  ): Promise<SkillModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.skillModel
      .findByIdAndUpdate(id, updateInput as object as UpdateQuery<SkillModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateSkillInput
  ): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.skillModel
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<SkillModel>,
        updateInput as object as UpdateQuery<SkillModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<SkillModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.skillModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.skillModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<SkillModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
