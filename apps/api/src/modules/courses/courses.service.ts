import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import { CoursesRepository } from "./courses.repository";
import { CreateCourseInput } from "./dto/create-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";

@Injectable()
export class CoursesService {
  constructor(private readonly repository: CoursesRepository) {}

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

  async findRecentActivity(limit: number): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.findRecentlyUpdated(
      limit,
      "slug i18n updatedAt"
    );
    return rows.map((row) => ({
      label: labelFromI18nTitle(
        row.slug as string,
        row.i18n as Parameters<typeof labelFromI18nTitle>[1]
      ),
      updatedAt: row.updatedAt,
    }));
  }

  detachSkill(skillId: string): Promise<void> {
    return this.repository.updateManyByFilter(
      { skills: skillId },
      { $pull: { skills: skillId } }
    );
  }

  purgeByOrganization(organizationId: string): Promise<void> {
    return this.repository.deleteManyByFilter({ organization: organizationId });
  }
}
