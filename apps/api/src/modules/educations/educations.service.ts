import { Injectable } from "@nestjs/common";
import { isNil } from "lodash";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type {
  FieldCount,
  MultiPaged,
  RecentActivityRecord,
} from "@/core/persistence/types/output.type";
import { OrganizationsValidatorService } from "@/modules/organizations/organizations-validator.service";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { CreateEducationInput } from "./dto/create-education.input";
import { FilterEducationInput } from "./dto/filter-education.input";
import { SortEducationInput } from "./dto/sort-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsRepository } from "./educations.repository";
import type { EducationEntityRecord } from "./entities/education.entity";

interface EducationCatalogRefs {
  organizationId?: string;
  skillIds?: string[];
}

@Injectable()
export class EducationsService {
  constructor(
    private readonly repository: EducationsRepository,
    private readonly organizationsValidator: OrganizationsValidatorService,
    private readonly skillsValidator: SkillsValidatorService
  ) {}

  findOneById(ctx: AuthContext, id: string): Promise<EducationEntityRecord> {
    return this.repository.tenantCrud(ctx).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterEducationInput;
    }
  ): Promise<EducationEntityRecord> {
    return this.repository.tenantCrud(ctx).findOne({ filters });
  }

  findManyById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<EducationEntityRecord[]> {
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
      filters?: FilterEducationInput;
      sort?: SortEducationInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<EducationEntityRecord>> {
    return this.repository.tenantCrud(ctx).findMany({
      filters,
      limit,
      skip,
      sort,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateEducationInput
  ): Promise<EducationEntityRecord> {
    await this.assertCatalogReferences(ctx, createInput);

    return this.repository.tenantCrud(ctx).createOne(createInput);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateEducationInput[]
  ): Promise<BatchEntity> {
    await this.assertCatalogReferencesMany(ctx, createInputs);

    return this.repository.tenantCrud(ctx).createMany(createInputs);
  }

  async updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateEducationInput
  ): Promise<EducationEntityRecord> {
    await this.assertCatalogReferences(ctx, updateInput);

    return this.repository.tenantCrud(ctx).updateOneById(id, updateInput);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    await this.assertCatalogReferences(ctx, updateInput);

    return this.repository.tenantCrud(ctx).updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<EducationEntityRecord> {
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
    input: EducationCatalogRefs
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
    inputs: EducationCatalogRefs[]
  ): Promise<void> {
    const organizationIds = [
      ...new Set(
        inputs
          .map((item) => item.organizationId)
          .filter((id): id is string => !isNil(id))
      ),
    ];
    const skillIds = [
      ...new Set(inputs.flatMap((item) => item.skillIds ?? [])),
    ];

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
