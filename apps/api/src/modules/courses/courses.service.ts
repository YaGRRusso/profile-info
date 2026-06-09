import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import { CreateCourseInput } from "./dto/create-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(CourseModel.name) readonly courseModel: Model<CourseModel>
  ) {}

  async findOneById(id: string): Promise<CourseModel> {
    assertValidObjectId(id);

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
    assertValidObjectIds(ids);

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
    assertValidObjectId(id);

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
    assertValidObjectIds(ids);

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
    assertValidObjectId(id);

    const res = await this.courseModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const res = await this.courseModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<CourseModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }

  async count(): Promise<number> {
    return await this.courseModel.countDocuments().exec();
  }

  async countByField(
    field: string
  ): Promise<{ label: string; value: number }[]> {
    const rows = await this.courseModel.aggregate<{
      _id: string;
      value: number;
    }>([
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);
    return rows.map((row) => ({ label: row._id, value: row.value }));
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.courseModel
      .updateMany({ skills: skillId }, { $pull: { skills: skillId } })
      .exec();
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.courseModel.deleteMany({ organization: organizationId }).exec();
  }
}
