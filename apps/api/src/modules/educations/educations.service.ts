import { Injectable } from "@nestjs/common";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { CreateEducationInput } from "./dto/create-education.input";
import { FilterEducationInput } from "./dto/filter-education.input";
import { SortEducationInput } from "./dto/sort-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsRepository } from "./educations.repository";
import type { EducationEntityRecord } from "./entities/education.entity";

@Injectable()
export class EducationsService {
  constructor(private readonly repository: EducationsRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<EducationEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterEducationInput;
    }
  ): Promise<EducationEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOne({ filters });
  }

  findManyById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<EducationEntityRecord[]> {
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
      filters?: FilterEducationInput;
      sort?: SortEducationInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<EducationEntityRecord>> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findMany({
      filters,
      sort,
      skip,
      limit,
    });
  }

  createOne(
    ctx: AuthContext,
    createInput: CreateEducationInput
  ): Promise<EducationEntityRecord> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .createOne(createInput);
  }

  createMany(
    ctx: AuthContext,
    createInputs: CreateEducationInput[]
  ): Promise<BatchEntity> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .createMany(createInputs);
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateEducationInput
  ): Promise<EducationEntityRecord> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateOneById(id, updateInput);
  }

  updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<EducationEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).deleteOneById(id);
  }

  removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).deleteManyById(ids);
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
    await this.repository.detachSkill(skillId);
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.purgeByOrganization(organizationId);
  }
}
