import {
  Args,
  Context,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { sortDateRange } from "@/common/helpers/daterange.helper";
import type { RequestContext } from "@/core/context/request-context.interface";
import { Public } from "@/core/decorators/public-route.decorator";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CurrentRequestContext } from "@/modules/auth/decorators/current-request-context.decorator";
import {
  ExperienceModel,
  ExperienceRoleModel,
} from "@/modules/experiences/schemas/experience.schema";
import type { Ctx } from "@/modules/graphql/context.interface";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { FilterExperienceInput } from "./dto/filter-experience.input";
import { SortExperienceInput } from "./dto/sort-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import {
  ExperienceEntity,
  ExperienceRole,
  PaginatedExperienceEntity,
} from "./entities/experience.entity";
import { ExperiencesService } from "./experiences.service";

@Resolver(() => ExperienceEntity)
export class ExperiencesResolver {
  constructor(private readonly experiencesService: ExperiencesService) {}

  // QUERIES

  @Public()
  @Query(() => ExperienceEntity)
  findOneExperienceById(
    @Args("experienceId", { type: () => ID }) experienceId: string
  ) {
    return this.experiencesService.findOneById(null, experienceId);
  }

  @Public()
  @Query(() => ExperienceEntity)
  findOneExperience(
    @Args("experienceFilters", {
      type: () => FilterExperienceInput,
      nullable: true,
    })
    experienceFilters?: FilterExperienceInput
  ) {
    return this.experiencesService.findOne(null, {
      filters: experienceFilters,
    });
  }

  @Public()
  @Query(() => [ExperienceEntity])
  findManyExperienceById(
    @Args("experienceIds", { type: () => [ID] }) experienceIds: string[]
  ) {
    return this.experiencesService.findManyById(null, experienceIds);
  }

  @Public()
  @Query(() => PaginatedExperienceEntity)
  findManyExperiences(
    @Args("experienceFilters", {
      type: () => FilterExperienceInput,
      nullable: true,
    })
    experienceFilters?: FilterExperienceInput,
    @Args("experiencePagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    experiencePagination?: PaginationInput,
    @Args("experienceSort", {
      type: () => SortExperienceInput,
      nullable: true,
    })
    experienceSort?: SortExperienceInput
  ) {
    return this.experiencesService.findMany(null, {
      filters: experienceFilters,
      sort: experienceSort,
      limit: experiencePagination?.limit,
      skip: experiencePagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => ExperienceEntity)
  createOneExperience(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("createExperienceInput", { type: () => CreateExperienceInput })
    createExperienceInput: CreateExperienceInput
  ) {
    return this.experiencesService.createOne(ctx, createExperienceInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  createManyExperiences(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("createExperienceInputs", { type: () => [CreateExperienceInput] })
    createExperienceInputs: CreateExperienceInput[]
  ) {
    return this.experiencesService.createMany(ctx, createExperienceInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => ExperienceEntity)
  updateOneExperience(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("experienceId", { type: () => ID }) experienceId: string,
    @Args("updateExperienceInput", { type: () => UpdateExperienceInput })
    updateExperienceInput: UpdateExperienceInput
  ) {
    return this.experiencesService.updateOne(
      ctx,
      experienceId,
      updateExperienceInput
    );
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  updateManyExperiences(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("experienceIds", { type: () => [ID] }) experienceIds: string[],
    @Args("updateExperienceInput", { type: () => UpdateExperienceInput })
    updateExperienceInput: UpdateExperienceInput
  ) {
    return this.experiencesService.updateMany(
      ctx,
      experienceIds,
      updateExperienceInput
    );
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => ExperienceEntity)
  removeOneExperience(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("experienceId", { type: () => ID }) experienceId: string
  ) {
    return this.experiencesService.removeOne(ctx, experienceId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManyExperiences(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("experienceIds", { type: () => [ID] }) experienceIds: string[]
  ) {
    return this.experiencesService.removeMany(ctx, experienceIds);
  }

  @ResolveField(() => UserEntity)
  owner(@Parent() experience: ExperienceModel, @Context() ctx: Ctx) {
    if (!experience?.ownerId) return null;
    return ctx.loaders.batchUsers.load(experience.ownerId.toString());
  }

  @ResolveField(() => [ExperienceRole])
  roles(@Parent() experience: ExperienceModel) {
    if (experience.roles) {
      return sortDateRange([...experience.roles]);
    }
  }

  @ResolveField(() => OrganizationEntity)
  organization(@Parent() experience: ExperienceModel, @Context() ctx: Ctx) {
    if (!experience?.organizationId) return null;
    return ctx.loaders.batchOrganizations.load(
      experience.organizationId.toString()
    );
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() experience: ExperienceModel, @Context() ctx: Ctx) {
    const ids = new Set<string>();

    for (const role of experience.roles) {
      if (role.skillIds) {
        for (const skill of role.skillIds) {
          ids.add(skill.toString());
        }
      }
    }

    return ctx.loaders.batchSkills.loadMany(Array.from(ids));
  }
}

@Resolver(() => ExperienceRole)
export class ExperienceRoleResolver {
  @ResolveField(() => [SkillEntity])
  skills(@Parent() role: ExperienceRoleModel, @Context() ctx: Ctx) {
    const ids = role.skillIds?.map((id) => id.toString());
    if (!ids) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
