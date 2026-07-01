import { Injectable } from "@nestjs/common";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { CreateProjectInput } from "./dto/create-project.input";
import { FilterProjectInput } from "./dto/filter-project.input";
import { SortProjectInput } from "./dto/sort-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import type { ProjectEntityRecord } from "./entities/project.entity";
import { ProjectsRepository } from "./projects.repository";

interface ProjectCatalogRefs {
  skillIds?: string[];
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly repository: ProjectsRepository,
    private readonly skillsValidator: SkillsValidatorService
  ) {}

  findOneById(ctx: AuthContext, id: string): Promise<ProjectEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterProjectInput;
    }
  ): Promise<ProjectEntityRecord> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOne({ filters });
  }

  findManyById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<ProjectEntityRecord[]> {
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
      filters?: FilterProjectInput;
      sort?: SortProjectInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<ProjectEntityRecord>> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findMany({
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateProjectInput
  ): Promise<ProjectEntityRecord> {
    await this.assertCatalogReferences(createInput);

    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .createOne(createInput);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateProjectInput[]
  ): Promise<BatchEntity> {
    await this.assertCatalogReferencesMany(createInputs);

    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .createMany(createInputs);
  }

  async updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateProjectInput
  ): Promise<ProjectEntityRecord> {
    await this.assertCatalogReferences(updateInput);

    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateOneById(id, updateInput);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    await this.assertCatalogReferences(updateInput);

    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<ProjectEntityRecord> {
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

  async purgeByOwner(ownerId: string): Promise<void> {
    await this.repository.purgeByOwner(ownerId);
  }

  private async assertCatalogReferences(
    input: ProjectCatalogRefs
  ): Promise<void> {
    if (input.skillIds?.length) {
      await this.skillsValidator.assertSkillsExist(input.skillIds);
    }
  }

  private async assertCatalogReferencesMany(
    inputs: ProjectCatalogRefs[]
  ): Promise<void> {
    const skillIds = [
      ...new Set(inputs.flatMap((item) => item.skillIds ?? [])),
    ];

    if (skillIds.length > 0) {
      await this.skillsValidator.assertSkillsExist(skillIds);
    }
  }
}
