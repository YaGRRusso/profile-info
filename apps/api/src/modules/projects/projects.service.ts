import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
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

  findOneById(_ctx: AuthContext | null, id: string): Promise<ProjectModel> {
    return this.repository.findOneById(id);
  }

  findOne(
    _ctx: AuthContext | null,
    {
      filters,
    }: {
      filters?: QueryFilter<ProjectModel>;
    }
  ): Promise<ProjectModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(
    _ctx: AuthContext | null,
    ids: string[]
  ): Promise<ProjectModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany(
    _ctx: AuthContext | null,
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
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(
    _ctx: AuthContext | null,
    createInput: CreateProjectInput
  ): Promise<ProjectModel> {
    return this.repository.createOne(createInput as AnyKeys<ProjectModel>);
  }

  createMany(
    _ctx: AuthContext | null,
    createInputs: CreateProjectInput[]
  ): Promise<BatchEntity> {
    return this.repository.createMany(createInputs as AnyKeys<ProjectModel>[]);
  }

  updateOne(
    _ctx: AuthContext | null,
    id: string,
    updateInput: UpdateProjectInput
  ): Promise<ProjectModel> {
    return this.repository.updateOneById(
      id,
      updateInput as object as UpdateQuery<ProjectModel>
    );
  }

  updateMany(
    _ctx: AuthContext | null,
    ids: string[],
    updateInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    return this.repository.updateManyById(
      ids,
      updateInput as object as UpdateQuery<ProjectModel>
    );
  }

  removeOne(_ctx: AuthContext | null, id: string): Promise<ProjectModel> {
    return this.repository.deleteOneById(id);
  }

  removeMany(_ctx: AuthContext | null, ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteManyById(ids);
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
