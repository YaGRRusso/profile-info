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
import { CourseModel } from "@/schemas/course.schema";
import { CreateCourseInput } from "./dto/create-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(CourseModel.name) readonly courseModel: Model<CourseModel>
  ) {}

  async findOneById(id: string): Promise<CourseModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.courseModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<CourseModel>;
  }): Promise<CourseModel> {
    const res = await this.courseModel
      .findOne(clearObject(filters) as QueryFilter<CourseModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<CourseModel[]> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.courseModel
      .find({ _id: { $in: ids } } as QueryFilter<CourseModel>)
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
    filters?: QueryFilter<CourseModel>;
    sort?: Partial<Record<keyof CourseModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<CourseModel>> {
    const nodes = await this.courseModel
      .find(clearObject(filters) as QueryFilter<CourseModel>)
      .sort(clearObject(sort) as Record<keyof CourseModel, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.courseModel
      .countDocuments(clearObject(filters) as QueryFilter<CourseModel>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return {
      nodes,
      found,
    };
  }

  async createOne(createInput: CreateCourseInput): Promise<CourseModel> {
    const res = await this.courseModel.create(
      createInput as AnyKeys<CourseModel>
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(createInputs: CreateCourseInput[]): Promise<CourseModel[]> {
    const res = await this.courseModel.create(
      createInputs as AnyKeys<CourseModel>[]
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateInput: UpdateCourseInput
  ): Promise<CourseModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.courseModel
      .findByIdAndUpdate(id, updateInput as object as UpdateQuery<CourseModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateCourseInput
  ): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.courseModel
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<CourseModel>,
        updateInput as object as UpdateQuery<CourseModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<CourseModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.courseModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.courseModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<CourseModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
