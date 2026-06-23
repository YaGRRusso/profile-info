import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import { ExperiencesRepository } from "./experiences.repository";

@Injectable()
export class ExperiencesService {
  constructor(private readonly repository: ExperiencesRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<ExperienceModel> {
    return this.repository.tenant.findOneById(toTenantScope(ctx), id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: QueryFilter<ExperienceModel>;
    }
  ): Promise<ExperienceModel> {
    return this.repository.tenant.findOne(toTenantScope(ctx), { filters });
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<ExperienceModel[]> {
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
      filters?: QueryFilter<ExperienceModel>;
      sort?: Partial<Record<keyof ExperienceModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<ExperienceModel>> {
    return this.repository.tenant.findMany(toTenantScope(ctx), {
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateExperienceInput
  ): Promise<ExperienceModel> {
    return await this.repository.tenant.createOne(
      toTenantScope(ctx),
      createInput as AnyKeys<ExperienceModel>
    );
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateExperienceInput[]
  ): Promise<BatchEntity> {
    return await this.repository.tenant.createMany(
      toTenantScope(ctx),
      createInputs as AnyKeys<ExperienceModel>[]
    );
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateExperienceInput
  ): Promise<ExperienceModel> {
    return this.repository.tenant.updateOneById(
      toTenantScope(ctx),
      id,
      updateInput as UpdateQuery<ExperienceModel>
    );
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateExperienceInput
  ): Promise<BatchEntity> {
    return await this.repository.tenant.updateManyById(
      toTenantScope(ctx),
      ids,
      updateInput as UpdateQuery<ExperienceModel>
    );
  }

  removeOne(ctx: AuthContext, id: string): Promise<ExperienceModel> {
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
      { "roles.skillIds": skillId },
      { $pull: { "roles.$[roleElem].skillIds": skillId } },
      { arrayFilters: [{ "roleElem.skillIds": skillId }] }
    );
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.deleteMany({ organizationId });
  }
}
