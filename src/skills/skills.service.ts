import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { Model, QueryFilter } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { clearObject } from "@/core/helpers/object.helper";
import { Search } from "@/core/interfaces/search.interface";
import { SkillModel } from "@/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(SkillModel.name) private readonly skillModel: Model<SkillModel>
  ) {}

  // QUERIES

  async findOneById(id: string): Promise<SkillModel> {
    const res = await this.skillModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res.toObject();
  }

  async findOne(filters?: QueryFilter<SkillModel>): Promise<SkillModel> {
    const res = await this.skillModel.findOne(clearObject(filters)).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<SkillModel[]> {
    const res = await this.skillModel.find({ _id: { $in: ids } }).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<SkillModel>): Promise<SkillModel[]> {
    const res = await this.skillModel
      .find(clearObject(filters))
      .sort({ isFeatured: -1, updatedAt: -1, ...clearObject(sort) })
      .skip(skip)
      .limit(limit)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  // MUTATIONS

  async createOne(createSkillInput: CreateSkillInput): Promise<SkillModel> {
    const res = await this.skillModel.create(createSkillInput);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createSkillInputs: CreateSkillInput[]
  ): Promise<SkillModel[]> {
    const res = await this.skillModel.create(createSkillInputs);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateSkillInput: UpdateSkillInput
  ): Promise<SkillModel> {
    const res = await this.skillModel
      .findByIdAndUpdate(id, updateSkillInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateSkillInput: UpdateSkillInput
  ): Promise<BatchEntity> {
    const res = await this.skillModel
      .updateMany({ _id: { $in: ids } }, updateSkillInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<SkillModel> {
    const res = await this.skillModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const res = await this.skillModel.deleteMany({ _id: { $in: ids } }).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
