import { Injectable } from "@nestjs/common";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type { MultiPaged } from "@/core/persistence/types/output.type";
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

  async createOne(
    ctx: AuthContext,
    createInput: CreateEducationInput
  ): Promise<EducationEntityRecord> {
    await this.assertCatalogReferences(createInput);

    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .createOne(createInput);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateEducationInput[]
  ): Promise<BatchEntity> {
    await this.assertCatalogReferencesMany(createInputs);

    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .createMany(createInputs);
  }

  async updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateEducationInput
  ): Promise<EducationEntityRecord> {
    await this.assertCatalogReferences(updateInput);

    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateOneById(id, updateInput);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    await this.assertCatalogReferences(updateInput);

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

  async purgeByOwner(ownerId: string): Promise<void> {
    await this.repository.purgeByOwner(ownerId);
  }

  private async assertCatalogReferences(
    input: EducationCatalogRefs
  ): Promise<void> {
    if (input.organizationId) {
      await this.organizationsValidator.assertOrganizationExists(
        input.organizationId
      );
    }

    if (input.skillIds?.length) {
      await this.skillsValidator.assertSkillsExist(input.skillIds);
    }
  }

  private async assertCatalogReferencesMany(
    inputs: EducationCatalogRefs[]
  ): Promise<void> {
    const organizationIds = [
      ...new Set(
        inputs
          .map((item) => item.organizationId)
          .filter((id): id is string => id !== undefined)
      ),
    ];
    const skillIds = [
      ...new Set(inputs.flatMap((item) => item.skillIds ?? [])),
    ];

    if (organizationIds.length > 0) {
      await this.organizationsValidator.assertOrganizationsExist(
        organizationIds
      );
    }

    if (skillIds.length > 0) {
      await this.skillsValidator.assertSkillsExist(skillIds);
    }
  }
}
