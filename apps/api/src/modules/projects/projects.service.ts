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
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import { ProjectEntity } from "./entities/project.entity";
import { ProjectsRepository } from "./projects.repository";
import { ProjectModel } from "./schemas/project.schema";

@Injectable()
export class ProjectsService {
  constructor(private readonly repository: ProjectsRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<ProjectEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: QueryFilter<ProjectModel>;
    }
  ): Promise<ProjectEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOne({ filters });
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<ProjectEntity[]> {
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
      filters?: QueryFilter<ProjectModel>;
      sort?: Partial<Record<keyof ProjectModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<ProjectEntity>> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findMany({
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateProjectInput
  ): Promise<ProjectEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .createOne(createInput as AnyKeys<ProjectModel>);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateProjectInput[]
  ): Promise<BatchEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .createMany(createInputs as AnyKeys<ProjectModel>[]);
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateProjectInput
  ): Promise<ProjectEntity> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateOneById(id, updateInput as UpdateQuery<ProjectModel>);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateManyById(ids, updateInput as UpdateQuery<ProjectModel>);
  }

  removeOne(ctx: AuthContext, id: string): Promise<ProjectEntity> {
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
    await this.repository.crud.updateMany(
      { skillIds: skillId },
      { $pull: { skillIds: skillId } }
    );
  }
}
