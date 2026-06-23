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
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsRepository } from "./educations.repository";

@Injectable()
export class EducationsService {
  constructor(private readonly repository: EducationsRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<EducationModel> {
    return this.repository.tenant.findOneById(toTenantScope(ctx), id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: QueryFilter<EducationModel>;
    }
  ): Promise<EducationModel> {
    return this.repository.tenant.findOne(toTenantScope(ctx), { filters });
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<EducationModel[]> {
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
      filters?: QueryFilter<EducationModel>;
      sort?: Partial<Record<keyof EducationModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<EducationModel>> {
    return this.repository.tenant.findMany(toTenantScope(ctx), {
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateEducationInput
  ): Promise<EducationModel> {
    return await this.repository.tenant.createOne(
      toTenantScope(ctx),
      createInput as AnyKeys<EducationModel>
    );
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateEducationInput[]
  ): Promise<BatchEntity> {
    return await this.repository.tenant.createMany(
      toTenantScope(ctx),
      createInputs as AnyKeys<EducationModel>[]
    );
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateEducationInput
  ): Promise<EducationModel> {
    return this.repository.tenant.updateOneById(
      toTenantScope(ctx),
      id,
      updateInput as UpdateQuery<EducationModel>
    );
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    return await this.repository.tenant.updateManyById(
      toTenantScope(ctx),
      ids,
      updateInput as UpdateQuery<EducationModel>
    );
  }

  removeOne(ctx: AuthContext, id: string): Promise<EducationModel> {
    return this.repository.tenant.deleteOneById(toTenantScope(ctx), id);
  }

  async removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return await this.repository.tenant.deleteManyById(toTenantScope(ctx), ids);
  }

  count(ctx: AuthContext): Promise<number> {
    return this.repository.tenantStats.count(toTenantScope(ctx));
  }

  async findRecentActivity(
    ctx: AuthContext,
    limit: number
  ): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.tenantStats.findRecentlyUpdated(
      toTenantScope(ctx),
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

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.deleteMany({ organizationId });
  }
}
