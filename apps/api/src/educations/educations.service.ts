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
import { EducationModel } from "@/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";

@Injectable()
export class EducationsService {
  constructor(
    @InjectModel(EducationModel.name)
    readonly educationModel: Model<EducationModel>
  ) {}

  async findOneById(id: string): Promise<EducationModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.educationModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<EducationModel>;
  }): Promise<EducationModel> {
    const res = await this.educationModel
      .findOne(clearObject(filters) as QueryFilter<EducationModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<EducationModel[]> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.educationModel
      .find({ _id: { $in: ids } } as QueryFilter<EducationModel>)
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
    filters?: QueryFilter<EducationModel>;
    sort?: Partial<Record<keyof EducationModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<EducationModel>> {
    const nodes = await this.educationModel
      .find(clearObject(filters) as QueryFilter<EducationModel>)
      .sort(clearObject(sort) as Record<keyof EducationModel, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.educationModel
      .countDocuments(clearObject(filters) as QueryFilter<EducationModel>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return {
      nodes,
      found,
    };
  }

  async createOne(createInput: CreateEducationInput): Promise<EducationModel> {
    const res = await this.educationModel.create(
      createInput as AnyKeys<EducationModel>
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createInputs: CreateEducationInput[]
  ): Promise<EducationModel[]> {
    const res = await this.educationModel.create(
      createInputs as AnyKeys<EducationModel>[]
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateInput: UpdateEducationInput
  ): Promise<EducationModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.educationModel
      .findByIdAndUpdate(
        id,
        updateInput as object as UpdateQuery<EducationModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.educationModel
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<EducationModel>,
        updateInput as object as UpdateQuery<EducationModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<EducationModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.educationModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.educationModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<EducationModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
