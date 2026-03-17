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
import { ExperienceModel } from "@/schemas/experience.schema";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectModel(ExperienceModel.name)
    private readonly experienceModel: Model<ExperienceModel>
  ) {}

  // QUERIES

  async findOneById(id: string): Promise<ExperienceModel> {
    const res = await this.experienceModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne(
    filters?: QueryFilter<ExperienceModel>
  ): Promise<ExperienceModel> {
    const res = await this.experienceModel.findOne(clearObject(filters)).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<ExperienceModel[]> {
    const res = await this.experienceModel.find({ _id: { $in: ids } }).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<ExperienceModel>): Promise<ExperienceModel[]> {
    const res = await this.experienceModel
      .find(clearObject(filters))
      .sort({ isFeatured: -1, updatedAt: -1, ...clearObject(sort) })
      .skip(skip)
      .limit(limit)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  // MUTATIONS

  async createOne(
    createExperienceInput: CreateExperienceInput
  ): Promise<ExperienceModel> {
    const res = await this.experienceModel.create(createExperienceInput);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createExperienceInputs: CreateExperienceInput[]
  ): Promise<ExperienceModel[]> {
    const res = await this.experienceModel.create(createExperienceInputs);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateExperienceInput: UpdateExperienceInput
  ): Promise<ExperienceModel> {
    const res = await this.experienceModel
      .findByIdAndUpdate(id, updateExperienceInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateExperienceInput: UpdateExperienceInput
  ): Promise<BatchEntity> {
    const res = await this.experienceModel
      .updateMany({ _id: { $in: ids } }, updateExperienceInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<ExperienceModel> {
    const res = await this.experienceModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const res = await this.experienceModel
      .deleteMany({ _id: { $in: ids } })
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
