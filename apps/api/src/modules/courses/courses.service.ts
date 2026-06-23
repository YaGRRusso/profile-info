import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/request-context.helper";
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

  findOneById(ctx: RequestContext, id: string): Promise<CourseModel> {
    return this.repository.tenant.findOneById(toTenantScope(ctx), id);
  }

  findOne(
    ctx: RequestContext,
    {
      filters,
    }: {
      filters?: QueryFilter<CourseModel>;
    }
  ): Promise<CourseModel> {
    return this.repository.tenant.findOne(toTenantScope(ctx), { filters });
  }

  findManyById(ctx: RequestContext, ids: string[]): Promise<CourseModel[]> {
    return this.repository.tenant.findManyById(toTenantScope(ctx), ids);
  }

  findMany(
    ctx: RequestContext,
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
    ctx: RequestContext,
    createInput: CreateCourseInput
  ): Promise<CourseModel> {
    const scope = toTenantScope(ctx);

    return await this.repository.tenant.createOne(
      scope,
      this.toCreatePayload(createInput)
    );
  }

  async createMany(
    ctx: RequestContext,
    createInputs: CreateCourseInput[]
  ): Promise<BatchEntity> {
    const scope = toTenantScope(ctx);
    const payloads = createInputs.map((input) => this.toCreatePayload(input));

    return await this.repository.tenant.createMany(scope, payloads);
  }

  updateOne(
    ctx: RequestContext,
    id: string,
    updateInput: UpdateCourseInput
  ): Promise<CourseModel> {
    const scope = toTenantScope(ctx);

    return this.repository.tenant.updateOneById(
      scope,
      id,
      this.toUpdatePayload(updateInput)
    );
  }

  async updateMany(
    ctx: RequestContext,
    ids: string[],
    updateInput: UpdateCourseInput
  ): Promise<BatchEntity> {
    const scope = toTenantScope(ctx);

    return await this.repository.tenant.updateManyById(
      scope,
      ids,
      this.toUpdatePayload(updateInput)
    );
  }

  removeOne(ctx: RequestContext, id: string): Promise<CourseModel> {
    const scope = toTenantScope(ctx);

    return this.repository.tenant.deleteOneById(scope, id);
  }

  async removeMany(ctx: RequestContext, ids: string[]): Promise<BatchEntity> {
    const scope = toTenantScope(ctx);

    return await this.repository.tenant.deleteManyById(scope, ids);
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

  private toCreatePayload(input: CreateCourseInput): AnyKeys<CourseModel> {
    const { ownerId: _, ...rest } = input as CreateCourseInput & {
      ownerId?: string;
    };

    return rest as AnyKeys<CourseModel>;
  }

  private toUpdatePayload(
    updateInput: UpdateCourseInput
  ): UpdateQuery<CourseModel> {
    const { ownerId: _, ...rest } = updateInput as UpdateCourseInput & {
      ownerId?: string;
    };

    return rest as UpdateQuery<CourseModel>;
  }
}
