import { Injectable } from "@nestjs/common";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type {
  FieldCount,
  MultiPaged,
} from "@/core/persistence/types/output.type";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { FilterExperienceInput } from "./dto/filter-experience.input";
import { SortExperienceInput } from "./dto/sort-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import type { ExperienceEntityRecord } from "./entities/experience.entity";
import { ExperiencesRepository } from "./experiences.repository";

@Injectable()
export class ExperiencesService {
  constructor(private readonly repository: ExperiencesRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<ExperienceEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterExperienceInput;
    }
  ): Promise<ExperienceEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOne({ filters });
  }

  findManyById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<ExperienceEntityRecord[]> {
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
      filters?: FilterExperienceInput;
      sort?: SortExperienceInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<ExperienceEntityRecord>> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findMany({
      filters,
      sort,
      skip,
      limit,
    });
  }

  createOne(
    ctx: AuthContext,
    createInput: CreateExperienceInput
  ): Promise<ExperienceEntityRecord> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .createOne(createInput);
  }

  createMany(
    ctx: AuthContext,
    createInputs: CreateExperienceInput[]
  ): Promise<BatchEntity> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .createMany(createInputs);
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateExperienceInput
  ): Promise<ExperienceEntityRecord> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateOneById(id, updateInput);
  }

  updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateExperienceInput
  ): Promise<BatchEntity> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<ExperienceEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).deleteOneById(id);
  }

  removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).deleteManyById(ids);
  }

  count(ctx: AuthContext): Promise<number> {
    return this.repository.stats.scoped(toTenantScope(ctx)).count();
  }

  countByField(ctx: AuthContext, field: string): Promise<FieldCount[]> {
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
    await this.repository.detachSkill(skillId);
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.purgeByOrganization(organizationId);
  }
}
