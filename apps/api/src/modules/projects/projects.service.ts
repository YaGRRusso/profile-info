import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import type { RequestContext } from "@/core/context/request-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { ProjectModel } from "@/modules/projects/schemas/project.schema";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import { ProjectsRepository } from "./projects.repository";

@Injectable()
export class ProjectsService {
  constructor(private readonly repository: ProjectsRepository) {}

  findOneById(_ctx: RequestContext | null, id: string): Promise<ProjectModel> {
    return this.repository.findOneById(id);
  }

  findOne(
    _ctx: RequestContext | null,
    {
      filters,
    }: {
      filters?: QueryFilter<ProjectModel>;
    }
  ): Promise<ProjectModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(
    _ctx: RequestContext | null,
    ids: string[]
  ): Promise<ProjectModel[]> {
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
      filters?: QueryFilter<ProjectModel>;
      sort?: Partial<Record<keyof ProjectModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<ProjectModel>> {
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(
    _ctx: RequestContext | null,
    createInput: CreateProjectInput
  ): Promise<ProjectModel> {
    return this.repository.createOne(createInput as AnyKeys<ProjectModel>);
  }

  createMany(
    _ctx: RequestContext | null,
    createInputs: CreateProjectInput[]
  ): Promise<ProjectModel[]> {
    return this.repository.createMany(createInputs as AnyKeys<ProjectModel>[]);
  }

  updateOne(
    _ctx: RequestContext | null,
    id: string,
    updateInput: UpdateProjectInput
  ): Promise<ProjectModel> {
    return this.repository.updateOne(
      id,
      updateInput as object as UpdateQuery<ProjectModel>
    );
  }

  updateMany(
    _ctx: RequestContext | null,
    ids: string[],
    updateInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    return this.repository.updateMany(
      ids,
      updateInput as object as UpdateQuery<ProjectModel>
    );
  }

  removeOne(_ctx: RequestContext | null, id: string): Promise<ProjectModel> {
    return this.repository.deleteOne(id);
  }

  removeMany(_ctx: RequestContext | null, ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteMany(ids);
  }

  count(): Promise<number> {
    return this.repository.count();
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
}
