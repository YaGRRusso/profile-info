import { Injectable } from "@nestjs/common";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { FieldCount, MultiPaged } from "@/core/persistence/types/output.type";
import { OrganizationsValidatorService } from "@/modules/organizations/organizations-validator.service";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { CoursesRepository } from "./courses.repository";
import { CreateCourseInput } from "./dto/create-course.input";
import { FilterCourseInput } from "./dto/filter-course.input";
import { SortCourseInput } from "./dto/sort-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";
import { CourseEntityRecord } from "./entities/course.entity";

interface CourseCatalogRefs {
  organizationId?: string;
  skillIds?: string[];
}

@Injectable()
export class CoursesService {
  constructor(
    private readonly repository: CoursesRepository,
    private readonly organizationsValidator: OrganizationsValidatorService,
    private readonly skillsValidator: SkillsValidatorService
  ) {}

  findOneById(ctx: AuthContext, id: string): Promise<CourseEntityRecord> {
    return this.repository.tenantCrud(ctx).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterCourseInput;
    }
  ): Promise<CourseEntityRecord> {
    return this.repository.tenantCrud(ctx).findOne({ filters });
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<CourseEntityRecord[]> {
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
      filters?: FilterCourseInput;
      sort?: SortCourseInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<CourseEntityRecord>> {
    return this.repository.tenantCrud(ctx).findMany({
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    createInput: CreateCourseInput
  ): Promise<CourseEntityRecord> {
    await this.assertCatalogReferences(ctx, createInput);

    return await this.repository.tenantCrud(ctx).createOne(createInput);
  }

  async createMany(
    ctx: AuthContext,
    createInputs: CreateCourseInput[]
  ): Promise<BatchEntity> {
    await this.assertCatalogReferencesMany(ctx, createInputs);

    return await this.repository.tenantCrud(ctx).createMany(createInputs);
  }

  async updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateCourseInput
  ): Promise<CourseEntityRecord> {
    await this.assertCatalogReferences(ctx, updateInput);

    return this.repository.tenantCrud(ctx).updateOneById(id, updateInput);
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateCourseInput
  ): Promise<BatchEntity> {
    await this.assertCatalogReferences(ctx, updateInput);

    return await this.repository
      .tenantCrud(ctx)
      .updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<CourseEntityRecord> {
    return this.repository.tenantCrud(ctx).deleteOneById(id);
  }

  async removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return await this.repository.tenantCrud(ctx).deleteManyById(ids);
  }

  count(ctx: AuthContext): Promise<number> {
    return this.repository.tenantStats(ctx).count();
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
    ctx: AuthContext,
    input: CourseCatalogRefs
  ): Promise<void> {
    if (input.organizationId) {
      await this.organizationsValidator.assertOrganizationExists(
        ctx,
        input.organizationId
      );
    }

    if (input.skillIds?.length) {
      await this.skillsValidator.assertSkillsExist(ctx, input.skillIds);
    }
  }

  private async assertCatalogReferencesMany(
    ctx: AuthContext,
    inputs: CourseCatalogRefs[]
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
        ctx,
        organizationIds
      );
    }

    if (skillIds.length > 0) {
      await this.skillsValidator.assertSkillsExist(ctx, skillIds);
    }
  }
}
