import { Injectable } from "@nestjs/common";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { MultiPaged } from "@/core/persistence/types/output.type";
import { CoursesRepository } from "./courses.repository";
import { CreateCourseInput } from "./dto/create-course.input";
import { FilterCourseInput } from "./dto/filter-course.input";
import { SortCourseInput } from "./dto/sort-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";
import { CourseEntityRecord } from "./entities/course.entity";

@Injectable()
export class CoursesService {
  constructor(private readonly repository: CoursesRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<CourseEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterCourseInput;
    }
  ): Promise<CourseEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOne({ filters });
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<CourseEntityRecord[]> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findManyById(ids);
  }

  findMany(
    ctx: AuthContext,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: FilterCourseInput;
      sort?: SortCourseInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<CourseEntityRecord>> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findMany({
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateCourseInput
  ): Promise<CourseEntityRecord> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .createOne(createInput);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateCourseInput[]
  ): Promise<BatchEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .createMany(createInputs);
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateCourseInput
  ): Promise<CourseEntityRecord> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateOneById(id, updateInput);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateCourseInput
  ): Promise<BatchEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<CourseEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).deleteOneById(id);
  }

  async removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .deleteManyById(ids);
  }

  count(ctx: AuthContext): Promise<number> {
    return this.repository.stats.scoped(toTenantScope(ctx)).count();
  }

  countByField(
    ctx: AuthContext,
    field: string
  ): Promise<{ label: string; value: number }[]> {
    return this.repository.stats.scoped(toTenantScope(ctx)).countByField(field);
  }

  async findRecentActivity(
    ctx: AuthContext,
    limit: number
  ): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.stats
      .scoped(toTenantScope(ctx))
      .findRecentlyUpdated(limit, "slug i18n updatedAt");
    return rows.map((row) => ({
      label: labelFromI18nTitle(
        row.slug as string,
        row.i18n as Parameters<typeof labelFromI18nTitle>[1]
      ),
      updatedAt: row.updatedAt,
    }));
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.repository.detachSkill(skillId);
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.purgeByOrganization(organizationId);
  }
}
