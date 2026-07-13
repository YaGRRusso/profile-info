import { Injectable } from "@nestjs/common";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type {
  MultiPaged,
  RecentActivityRecord,
} from "@/core/persistence/types/output.type";
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
    return this.repository.tenantCrud(ctx).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterProjectInput;
    }
  ): Promise<ProjectEntityRecord> {
    return this.repository.tenantCrud(ctx).findOne({ filters });
  }

  findManyById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<ProjectEntityRecord[]> {
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
      filters?: FilterProjectInput;
      sort?: SortProjectInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<ProjectEntityRecord>> {
    return this.repository.tenantCrud(ctx).findMany({
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
    await this.assertCatalogReferences(ctx, createInput);

    return this.repository.tenantCrud(ctx).createOne(createInput);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateProjectInput[]
  ): Promise<BatchEntity> {
    await this.assertCatalogReferencesMany(ctx, createInputs);

    return this.repository.tenantCrud(ctx).createMany(createInputs);
  }

  async updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateProjectInput
  ): Promise<ProjectEntityRecord> {
    await this.assertCatalogReferences(ctx, updateInput);

    return this.repository.tenantCrud(ctx).updateOneById(id, updateInput);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    await this.assertCatalogReferences(ctx, updateInput);

    return this.repository.tenantCrud(ctx).updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<ProjectEntityRecord> {
    return this.repository.tenantCrud(ctx).deleteOneById(id);
  }

  removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.tenantCrud(ctx).deleteManyById(ids);
  }

  count(ctx: AuthContext): Promise<number> {
    return this.repository.tenantStats(ctx).count();
  }

  async findRecentActivity(
    ctx: AuthContext,
    limit: number
  ): Promise<RecentActivityRecord[]> {
    const rows = await this.repository
      .tenantStats(ctx)
      .findRecentlyUpdated(limit, "slug i18n updatedAt");
    return rows.map((row) => ({
      slug: row.slug as string | undefined,
      i18n: (row.i18n as RecentActivityRecord["i18n"]) ?? [],
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
    ctx: AuthContext,
    input: ProjectCatalogRefs
  ): Promise<void> {
    if (input.skillIds?.length) {
      await this.skillsValidator.assertSkillsEnabled(ctx, input.skillIds);
    }
  }

  private async assertCatalogReferencesMany(
    ctx: AuthContext,
    inputs: ProjectCatalogRefs[]
  ): Promise<void> {
    const skillIds = [
      ...new Set(inputs.flatMap((item) => item.skillIds ?? [])),
    ];

    if (skillIds.length > 0) {
      await this.skillsValidator.assertSkillsEnabled(ctx, skillIds);
    }
  }
}
