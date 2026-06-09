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
import { Public } from "@/core/decorators/public-route.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import {
  ExperienceModel,
  ExperienceRoleModel,
} from "@/modules/experiences/schemas/experience.schema";
import type { Ctx } from "@/modules/graphql/context.interface";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
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
    return this.experiencesService.findOneById(experienceId);
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
    return this.experiencesService.findOne({ filters: experienceFilters });
  }

  @Public()
  @Query(() => [ExperienceEntity])
  findManyExperienceById(
    @Args("experienceIds", { type: () => [ID] }) experienceIds: string[]
  ) {
    return this.experiencesService.findManyById(experienceIds);
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
    return this.experiencesService.findMany({
      filters: experienceFilters,
      sort: experienceSort,
      limit: experiencePagination?.limit,
      skip: experiencePagination?.skip,
    });
  }

  // MUTATIONS

  @Mutation(() => ExperienceEntity)
  createOneExperience(
    @Args("createExperienceInput", { type: () => CreateExperienceInput })
    createExperienceInput: CreateExperienceInput
  ) {
    return this.experiencesService.createOne(createExperienceInput);
  }

  @Mutation(() => [ExperienceEntity])
  createManyExperiences(
    @Args("createExperienceInputs", { type: () => [CreateExperienceInput] })
    createExperienceInputs: CreateExperienceInput[]
  ) {
    return this.experiencesService.createMany(createExperienceInputs);
  }

  @Mutation(() => ExperienceEntity)
  updateOneExperience(
    @Args("experienceId", { type: () => ID }) experienceId: string,
    @Args("updateExperienceInput", { type: () => UpdateExperienceInput })
    updateExperienceInput: UpdateExperienceInput
  ) {
    return this.experiencesService.updateOne(
      experienceId,
      updateExperienceInput
    );
  }

  @Mutation(() => BatchEntity)
  updateManyExperiences(
    @Args("experienceIds", { type: () => [ID] }) experienceIds: string[],
    @Args("updateExperienceInput", { type: () => UpdateExperienceInput })
    updateExperienceInput: UpdateExperienceInput
  ) {
    return this.experiencesService.updateMany(
      experienceIds,
      updateExperienceInput
    );
  }

  @Mutation(() => ExperienceEntity)
  removeOneExperience(
    @Args("experienceId", { type: () => ID }) experienceId: string
  ) {
    return this.experiencesService.removeOne(experienceId);
  }

  @Mutation(() => BatchEntity)
  removeManyExperiences(
    @Args("experienceIds", { type: () => [ID] }) experienceIds: string[]
  ) {
    return this.experiencesService.removeMany(experienceIds);
  }

  @ResolveField(() => [ExperienceRole])
  roles(@Parent() experience: ExperienceModel) {
    if (experience.roles) {
      return sortDateRange([...experience.roles]);
    }
  }

  @ResolveField(() => OrganizationEntity)
  organization(@Parent() experience: ExperienceModel, @Context() ctx: Ctx) {
    if (!experience?.organization) return null;
    return ctx.loaders.batchOrganizations.load(
      experience.organization.toString()
    );
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() experience: ExperienceModel, @Context() ctx: Ctx) {
    const ids = new Set<string>();

    for (const role of experience.roles) {
      if (role.skills) {
        for (const skill of role.skills) {
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
    const ids = role.skills?.map((id) => id.toString());
    if (!ids) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
