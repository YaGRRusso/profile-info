import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import { ExperienceEntity } from "./entities/experience.entity";
import { ExperiencesRepository } from "./experiences.repository";
import { ExperienceModel } from "./schemas/experience.schema";

@Injectable()
export class ExperiencesService {
  constructor(private readonly repository: ExperiencesRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<ExperienceEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: QueryFilter<ExperienceModel>;
    }
  ): Promise<ExperienceEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOne({ filters });
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<ExperienceEntity[]> {
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
      filters?: QueryFilter<ExperienceModel>;
      sort?: Partial<Record<keyof ExperienceModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<ExperienceEntity>> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findMany({
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateExperienceInput
  ): Promise<ExperienceEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .createOne(createInput as AnyKeys<ExperienceModel>);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateExperienceInput[]
  ): Promise<BatchEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .createMany(createInputs as AnyKeys<ExperienceModel>[]);
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateExperienceInput
  ): Promise<ExperienceEntity> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateOneById(id, updateInput as UpdateQuery<ExperienceModel>);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateExperienceInput
  ): Promise<BatchEntity> {
    return await this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateManyById(ids, updateInput as UpdateQuery<ExperienceModel>);
  }

  removeOne(ctx: AuthContext, id: string): Promise<ExperienceEntity> {
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
      .findRecentlyUpdated(limit, "slug roles updatedAt");
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
    await this.repository.crud.updateMany(
      { "roles.skillIds": skillId },
      { $pull: { "roles.$[roleElem].skillIds": skillId } },
      { arrayFilters: [{ "roleElem.skillIds": skillId }] }
    );
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.crud.deleteMany({ organizationId });
  }
}
