import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import type { RequestContext } from "@/core/context/request-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import { ExperiencesRepository } from "./experiences.repository";

@Injectable()
export class ExperiencesService {
  constructor(private readonly repository: ExperiencesRepository) {}

  findOneById(
    _ctx: RequestContext | null,
    id: string
  ): Promise<ExperienceModel> {
    return this.repository.findOneById(id);
  }

  findOne(
    _ctx: RequestContext | null,
    {
      filters,
    }: {
      filters?: QueryFilter<ExperienceModel>;
    }
  ): Promise<ExperienceModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(
    _ctx: RequestContext | null,
    ids: string[]
  ): Promise<ExperienceModel[]> {
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
      filters?: QueryFilter<ExperienceModel>;
      sort?: Partial<Record<keyof ExperienceModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<ExperienceModel>> {
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(
    _ctx: RequestContext | null,
    createInput: CreateExperienceInput
  ): Promise<ExperienceModel> {
    return this.repository.createOne(createInput as AnyKeys<ExperienceModel>);
  }

  createMany(
    _ctx: RequestContext | null,
    createInputs: CreateExperienceInput[]
  ): Promise<BatchEntity> {
    return this.repository.createMany(
      createInputs as AnyKeys<ExperienceModel>[]
    );
  }

  updateOne(
    _ctx: RequestContext | null,
    id: string,
    updateInput: UpdateExperienceInput
  ): Promise<ExperienceModel> {
    return this.repository.updateOneById(
      id,
      updateInput as object as UpdateQuery<ExperienceModel>
    );
  }

  updateMany(
    _ctx: RequestContext | null,
    ids: string[],
    updateInput: UpdateExperienceInput
  ): Promise<BatchEntity> {
    return this.repository.updateManyById(
      ids,
      updateInput as object as UpdateQuery<ExperienceModel>
    );
  }

  removeOne(_ctx: RequestContext | null, id: string): Promise<ExperienceModel> {
    return this.repository.deleteOneById(id);
  }

  removeMany(_ctx: RequestContext | null, ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteManyById(ids);
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
      "slug roles updatedAt"
    );
    return rows.map((row) => {
      const roles = row.roles as
        | Array<{ i18n?: Array<{ messages?: { title?: string } }> }>
        | undefined;
      const title = roles?.[0]?.i18n?.[0]?.messages?.title;
      return {
        label: title ?? (row.slug as string),
        updatedAt: row.updatedAt,
      };
    });
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.repository.updateMany(
      { "roles.skills": skillId },
      { $pull: { "roles.$[roleElem].skills": skillId } },
      { arrayFilters: [{ "roleElem.skills": skillId }] }
    );
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.deleteMany({ organization: organizationId });
  }
}
