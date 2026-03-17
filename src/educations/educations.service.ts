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
import { EducationModel } from "@/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";

@Injectable()
export class EducationsService {
  constructor(
    @InjectModel(EducationModel.name)
    private readonly educationModel: Model<EducationModel>
  ) {}

  // QUERIES

  async findOneById(id: string): Promise<EducationModel> {
    const res = await this.educationModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne(
    filters?: QueryFilter<EducationModel>
  ): Promise<EducationModel> {
    const res = await this.educationModel.findOne(clearObject(filters)).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<EducationModel[]> {
    const res = await this.educationModel.find({ _id: { $in: ids } }).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<EducationModel>): Promise<EducationModel[]> {
    const res = await this.educationModel
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
    createEducationInput: CreateEducationInput
  ): Promise<EducationModel> {
    const res = await this.educationModel.create(createEducationInput);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createEducationInputs: CreateEducationInput[]
  ): Promise<EducationModel[]> {
    const res = await this.educationModel.create(createEducationInputs);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateEducationInput: UpdateEducationInput
  ): Promise<EducationModel> {
    const res = await this.educationModel
      .findByIdAndUpdate(id, updateEducationInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateEducationInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    const res = await this.educationModel
      .updateMany({ _id: { $in: ids } }, updateEducationInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<EducationModel> {
    const res = await this.educationModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const res = await this.educationModel
      .deleteMany({ _id: { $in: ids } })
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
