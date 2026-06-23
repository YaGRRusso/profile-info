import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import type { RequestContext } from "@/core/context/request-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import { CoursesRepository } from "./courses.repository";
import { CreateCourseInput } from "./dto/create-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";

@Injectable()
export class CoursesService {
  constructor(private readonly repository: CoursesRepository) {}

  findOneById(_ctx: RequestContext | null, id: string): Promise<CourseModel> {
    return this.repository.findOneById(id);
  }

  findOne(
    _ctx: RequestContext | null,
    {
      filters,
    }: {
      filters?: QueryFilter<CourseModel>;
    }
  ): Promise<CourseModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(
    _ctx: RequestContext | null,
    ids: string[]
  ): Promise<CourseModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany(
    _ctx: RequestContext | null,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: QueryFilter<CourseModel>;
      sort?: Partial<Record<keyof CourseModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<CourseModel>> {
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(
    _ctx: RequestContext | null,
    createInput: CreateCourseInput
  ): Promise<CourseModel> {
    return this.repository.createOne(createInput as AnyKeys<CourseModel>);
  }

  async createMany(
    _ctx: RequestContext | null,
    createInputs: CreateCourseInput[]
  ): Promise<BatchEntity> {
    return await this.repository.createMany(
      createInputs as AnyKeys<CourseModel>[]
    );
  }

  updateOne(
    _ctx: RequestContext | null,
    id: string,
    updateInput: UpdateCourseInput
  ): Promise<CourseModel> {
    return this.repository.updateOneById(
      id,
      updateInput as object as UpdateQuery<CourseModel>
    );
  }

  async updateMany(
    _ctx: RequestContext | null,
    ids: string[],
    updateInput: UpdateCourseInput
  ): Promise<BatchEntity> {
    return await this.repository.updateManyById(
      ids,
      updateInput as object as UpdateQuery<CourseModel>
    );
  }

  removeOne(_ctx: RequestContext | null, id: string): Promise<CourseModel> {
    return this.repository.deleteOneById(id);
  }

  async removeMany(
    _ctx: RequestContext | null,
    ids: string[]
  ): Promise<BatchEntity> {
    return await this.repository.deleteManyById(ids);
  }

  count(): Promise<number> {
    return this.repository.stats.count();
  }

  countByField(field: string): Promise<{ label: string; value: number }[]> {
    return this.repository.stats.countByField(field);
  }

  async findRecentActivity(limit: number): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.stats.findRecentlyUpdated(
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

  async detachSkill(skillId: string): Promise<void> {
    await this.repository.updateMany(
      { skills: skillId },
      { $pull: { skills: skillId } }
    );
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.deleteMany({ organization: organizationId });
  }
}
