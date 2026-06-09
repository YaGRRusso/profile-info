import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import { CreateCourseInput } from "./dto/create-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";

@Injectable()
export class CoursesService {
  private readonly repository: MongooseCrudRepository<CourseModel>;

  constructor(
    @InjectModel(CourseModel.name) readonly courseModel: Model<CourseModel>
  ) {
    this.repository = new MongooseCrudRepository(courseModel);
  }

  findOneById(id: string): Promise<CourseModel> {
    return this.repository.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<CourseModel>;
  }): Promise<CourseModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(ids: string[]): Promise<CourseModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany({
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
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateCourseInput): Promise<CourseModel> {
    return this.repository.createOne(createInput as AnyKeys<CourseModel>);
  }

  createMany(createInputs: CreateCourseInput[]): Promise<CourseModel[]> {
    return this.repository.createMany(createInputs as AnyKeys<CourseModel>[]);
  }

  updateOne(id: string, updateInput: UpdateCourseInput): Promise<CourseModel> {
    return this.repository.updateOne(
      id,
      updateInput as object as UpdateQuery<CourseModel>
    );
  }

  updateMany(
    ids: string[],
    updateInput: UpdateCourseInput
  ): Promise<BatchEntity> {
    return this.repository.updateMany(
      ids,
      updateInput as object as UpdateQuery<CourseModel>
    );
  }

  removeOne(id: string): Promise<CourseModel> {
    return this.repository.deleteOne(id);
  }

  removeMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteMany(ids);
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  countByField(field: string): Promise<{ label: string; value: number }[]> {
    return this.repository.countByField(field);
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
