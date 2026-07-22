import { Injectable } from "@nestjs/common";
import { isNil, uniq } from "lodash";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type {
  FieldCount,
  MultiPaged,
  RecentActivityRecord,
} from "@/core/persistence/types/output.type";
import { OrganizationsValidatorService } from "@/modules/organizations/organizations-validator.service";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { FilterExperienceInput } from "./dto/filter-experience.input";
import { SortExperienceInput } from "./dto/sort-experience.input";
import { SortGroupedExperienceInput } from "./dto/sort-grouped-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import type { ExperienceEntityRecord } from "./entities/experience.entity";
import type { GroupedExperienceEntityRecord } from "./entities/grouped-experience.entity";
import { ExperiencesRepository } from "./experiences.repository";

interface ExperienceCatalogRefs {
  organizationId?: string;
  skillIds?: string[];
}

@Injectable()
export class ExperiencesService {
  constructor(
    private readonly repository: ExperiencesRepository,
    private readonly organizationsValidator: OrganizationsValidatorService,
    private readonly skillsValidator: SkillsValidatorService
  ) {}

  findOneById(ctx: AuthContext, id: string): Promise<ExperienceEntityRecord> {
    return this.repository.tenantCrud(ctx).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterExperienceInput;
    }
  ): Promise<ExperienceEntityRecord> {
    return this.repository.tenantCrud(ctx).findOne({ filters });
  }

  findManyById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<ExperienceEntityRecord[]> {
    return this.repository.tenantCrud(ctx).findManyById(ids);
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
    return this.repository.tenantCrud(ctx).findMany({
      filters,
      limit,
      skip,
      sort,
    });
  }

  findManyGrouped(
    ctx: AuthContext,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: FilterExperienceInput;
      sort?: SortGroupedExperienceInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<GroupedExperienceEntityRecord>> {
    return this.repository.findManyGrouped(ctx, {
      filters,
      limit,
      skip,
      sort,
    });
  }

  findOneGrouped(
    ctx: AuthContext,
    {
      filters,
      sort,
    }: {
      filters?: FilterExperienceInput;
      sort?: SortGroupedExperienceInput;
    }
  ): Promise<GroupedExperienceEntityRecord> {
    return this.repository.findOneGrouped(ctx, { filters, sort });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateExperienceInput
  ): Promise<ExperienceEntityRecord> {
    await this.assertCatalogReferences(ctx, createInput);

    return this.repository.tenantCrud(ctx).createOne(createInput);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateExperienceInput[]
  ): Promise<BatchEntity> {
    await this.assertCatalogReferencesMany(ctx, createInputs);

    return this.repository.tenantCrud(ctx).createMany(createInputs);
  }

  async updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateExperienceInput
  ): Promise<ExperienceEntityRecord> {
    await this.assertCatalogReferences(ctx, updateInput);

    return this.repository.tenantCrud(ctx).updateOneById(id, updateInput);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateExperienceInput
  ): Promise<BatchEntity> {
    await this.assertCatalogReferences(ctx, updateInput);

    return this.repository.tenantCrud(ctx).updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<ExperienceEntityRecord> {
    return this.repository.tenantCrud(ctx).deleteOneById(id);
  }

  removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.tenantCrud(ctx).deleteManyById(ids);
  }

  count(ctx: AuthContext): Promise<number> {
    return this.repository.tenantStats(ctx).count();
  }

  countByOwners(ownerIds: string[]): Promise<FieldCount[]> {
    return this.repository.countByOwners(ownerIds);
  }

  countByField(ctx: AuthContext, field: string): Promise<FieldCount[]> {
    return this.repository.tenantStats(ctx).countByField(field);
  }

  async findRecentActivity(
    ctx: AuthContext,
    limit: number
  ): Promise<RecentActivityRecord[]> {
    const rows = await this.repository
      .tenantStats(ctx)
      .findRecentlyUpdated(limit, "slug i18n updatedAt");

    return rows.map((row) => ({
      i18n: (row.i18n as RecentActivityRecord["i18n"]) ?? [],
      slug: row.slug as string | undefined,
      updatedAt: row.updatedAt,
    }));
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.repository.detachSkill(skillId);
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.purgeByOrganization(organizationId);
  }

  async purgeByOwner(ownerId: string): Promise<void> {
    await this.repository.purgeByOwner(ownerId);
  }

  private async assertCatalogReferences(
    ctx: AuthContext,
    input: ExperienceCatalogRefs
  ): Promise<void> {
    if (input.organizationId) {
      await this.organizationsValidator.assertOrganizationEnabled(
        ctx,
        input.organizationId
      );
    }

    if (input.skillIds?.length) {
      await this.skillsValidator.assertSkillsEnabled(ctx, input.skillIds);
    }
  }

  private async assertCatalogReferencesMany(
    ctx: AuthContext,
    inputs: ExperienceCatalogRefs[]
  ): Promise<void> {
    const organizationIds = uniq(
      inputs
        .map((item) => item.organizationId)
        .filter((id): id is string => !isNil(id))
    );
    const skillIds = uniq(inputs.flatMap((item) => item.skillIds ?? []));

    if (organizationIds.length > 0) {
      await this.organizationsValidator.assertOrganizationsEnabled(
        ctx,
        organizationIds
      );
    }

    if (skillIds.length > 0) {
      await this.skillsValidator.assertSkillsEnabled(ctx, skillIds);
    }
  }
}
