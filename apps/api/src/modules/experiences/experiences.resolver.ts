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
import type { AuthContext } from "@/core/context/auth-context.interface";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { FilterExperienceInput } from "./dto/filter-experience.input";
import { SortExperienceInput } from "./dto/sort-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import {
  ExperienceEntity,
  PaginatedExperienceEntity,
} from "./entities/experience.entity";
import { ExperiencesService } from "./experiences.service";

@Resolver(() => ExperienceEntity)
export class ExperiencesResolver {
  constructor(private readonly experiencesService: ExperiencesService) {}

  // QUERIES

  @Query(() => ExperienceEntity)
  findOneExperienceById(
    @Auth() ctx: AuthContext,
    @Args("experienceId", { type: () => ID }) experienceId: string
  ) {
    return this.experiencesService.findOneById(ctx, experienceId);
  }

  @Query(() => ExperienceEntity)
  findOneExperience(
    @Auth() ctx: AuthContext,
    @Args("experienceFilters", {
      nullable: true,
      type: () => FilterExperienceInput,
    })
    experienceFilters?: FilterExperienceInput
  ) {
    return this.experiencesService.findOne(ctx, {
      filters: experienceFilters,
    });
  }

  @Query(() => [ExperienceEntity])
  findManyExperienceById(
    @Auth() ctx: AuthContext,
    @Args("experienceIds", { type: () => [ID] }) experienceIds: string[]
  ) {
    return this.experiencesService.findManyById(ctx, experienceIds);
  }

  @Query(() => PaginatedExperienceEntity)
  findManyExperiences(
    @Auth() ctx: AuthContext,
    @Args("experienceFilters", {
      nullable: true,
      type: () => FilterExperienceInput,
    })
    experienceFilters?: FilterExperienceInput,
    @Args("experiencePagination", {
      nullable: true,
      type: () => PaginationInput,
    })
    experiencePagination?: PaginationInput,
    @Args("experienceSort", {
      nullable: true,
      type: () => SortExperienceInput,
    })
    experienceSort?: SortExperienceInput
  ) {
    return this.experiencesService.findMany(ctx, {
      filters: experienceFilters,
      limit: experiencePagination?.limit,
      skip: experiencePagination?.skip,
      sort: experienceSort,
    });
  }

  // MUTATIONS

  @Mutation(() => ExperienceEntity)
  createOneExperience(
    @Auth() ctx: AuthContext,
    @Args("createExperienceInput", { type: () => CreateExperienceInput })
    createExperienceInput: CreateExperienceInput
  ) {
    return this.experiencesService.createOne(ctx, createExperienceInput);
  }

  @Mutation(() => BatchEntity)
  createManyExperiences(
    @Auth() ctx: AuthContext,
    @Args("createExperienceInputs", { type: () => [CreateExperienceInput] })
    createExperienceInputs: CreateExperienceInput[]
  ) {
    return this.experiencesService.createMany(ctx, createExperienceInputs);
  }

  @Mutation(() => ExperienceEntity)
  updateOneExperience(
    @Auth() ctx: AuthContext,
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

  @Mutation(() => BatchEntity)
  updateManyExperiences(
    @Auth() ctx: AuthContext,
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

  @Mutation(() => ExperienceEntity)
  removeOneExperience(
    @Auth() ctx: AuthContext,
    @Args("experienceId", { type: () => ID }) experienceId: string
  ) {
    return this.experiencesService.removeOne(ctx, experienceId);
  }

  @Mutation(() => BatchEntity)
  removeManyExperiences(
    @Auth() ctx: AuthContext,
    @Args("experienceIds", { type: () => [ID] }) experienceIds: string[]
  ) {
    return this.experiencesService.removeMany(ctx, experienceIds);
  }

  @ResolveField(() => UserEntity)
  owner(
    @Parent() experience: ExperienceEntity,
    @Context() ctx: GraphqlContext
  ) {
    const { ownerId } = experience;
    if (!ownerId) return null;
    return ctx.loaders.batchUsers.load(ownerId);
  }

  @ResolveField(() => OrganizationEntity, { nullable: true })
  organization(
    @Parent() experience: ExperienceEntity,
    @Context() ctx: GraphqlContext
  ) {
    const { ownerId, organizationId } = experience;
    if (!(organizationId && ownerId)) return null;
    return ctx.loaders.batchOrganizations.forKey(ownerId).load(organizationId);
  }

  @ResolveField(() => [SkillEntity])
  skills(
    @Parent() experience: ExperienceEntity,
    @Context() ctx: GraphqlContext
  ) {
    const { ownerId, skillIds } = experience;
    if (!(skillIds && ownerId)) return [];
    return ctx.loaders.batchSkills.forKey(ownerId).loadMany(skillIds);
  }
}
