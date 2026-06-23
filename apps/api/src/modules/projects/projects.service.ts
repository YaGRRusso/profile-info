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
import { ProjectModel } from "@/modules/projects/schemas/project.schema";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import { ProjectsRepository } from "./projects.repository";

@Injectable()
export class ProjectsService {
  constructor(private readonly repository: ProjectsRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<ProjectModel> {
    return this.repository.tenant.findOneById(toTenantScope(ctx), id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: QueryFilter<ProjectModel>;
    }
  ): Promise<ProjectModel> {
    return this.repository.tenant.findOne(toTenantScope(ctx), { filters });
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<ProjectModel[]> {
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
      filters?: QueryFilter<ProjectModel>;
      sort?: Partial<Record<keyof ProjectModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<ProjectModel>> {
    return this.repository.tenant.findMany(toTenantScope(ctx), {
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateProjectInput
  ): Promise<ProjectModel> {
    return await this.repository.tenant.createOne(
      toTenantScope(ctx),
      createInput as AnyKeys<ProjectModel>
    );
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateProjectInput[]
  ): Promise<BatchEntity> {
    return await this.repository.tenant.createMany(
      toTenantScope(ctx),
      createInputs as AnyKeys<ProjectModel>[]
    );
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateProjectInput
  ): Promise<ProjectModel> {
    return this.repository.tenant.updateOneById(
      toTenantScope(ctx),
      id,
      updateInput as UpdateQuery<ProjectModel>
    );
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    return await this.repository.tenant.updateManyById(
      toTenantScope(ctx),
      ids,
      updateInput as UpdateQuery<ProjectModel>
    );
  }

  removeOne(ctx: AuthContext, id: string): Promise<ProjectModel> {
    return this.repository.tenant.deleteOneById(toTenantScope(ctx), id);
  }

  async removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return await this.repository.tenant.deleteManyById(toTenantScope(ctx), ids);
  }

  count(): Promise<number> {
    return this.repository.stats.count();
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
}
