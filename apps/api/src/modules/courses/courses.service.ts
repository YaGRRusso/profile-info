import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import { CoursesRepository } from "./courses.repository";
import { CreateCourseInput } from "./dto/create-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";

@Injectable()
export class CoursesService {
  constructor(private readonly repository: CoursesRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<CourseModel> {
    return this.repository.tenant.findOneById(toTenantScope(ctx), id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: QueryFilter<CourseModel>;
    }
  ): Promise<CourseModel> {
    return this.repository.tenant.findOne(toTenantScope(ctx), { filters });
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<CourseModel[]> {
    return this.repository.tenant.findManyById(toTenantScope(ctx), ids);
  }

  findMany(
    ctx: AuthContext,
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
    return this.repository.tenant.findMany(toTenantScope(ctx), {
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateCourseInput
  ): Promise<CourseModel> {
    return await this.repository.tenant.createOne(
      toTenantScope(ctx),
      createInput as AnyKeys<CourseModel>
    );
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateCourseInput[]
  ): Promise<BatchEntity> {
    return await this.repository.tenant.createMany(
      toTenantScope(ctx),
      createInputs as AnyKeys<CourseModel>[]
    );
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateCourseInput
  ): Promise<CourseModel> {
    return this.repository.tenant.updateOneById(
      toTenantScope(ctx),
      id,
      updateInput as UpdateQuery<CourseModel>
    );
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateCourseInput
  ): Promise<BatchEntity> {
    return await this.repository.tenant.updateManyById(
      toTenantScope(ctx),
      ids,
      updateInput as UpdateQuery<CourseModel>
    );
  }

  removeOne(ctx: AuthContext, id: string): Promise<CourseModel> {
    return this.repository.tenant.deleteOneById(toTenantScope(ctx), id);
  }

  async removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return await this.repository.tenant.deleteManyById(toTenantScope(ctx), ids);
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
      { skillIds: skillId },
      { $pull: { skillIds: skillId } }
    );
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.deleteMany({ organizationId });
  }
}
