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
import { Public } from "@/core/decorators/public-route.decorator";
import { sortDateRange } from "@/core/helpers/daterange.helper";
import { PaginationInput } from "@/core/inputs/pagination.input";
import type { Ctx } from "@/core/interfaces/context.interface";
import { OrganizationEntity } from "@/organizations/entities/organization.entity";
import type {
  ExperienceModel,
  ExperienceRoleModel,
} from "@/schemas/experience.schema";
import { SkillEntity } from "@/skills/entities/skill.entity";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { FilterExperienceInput } from "./dto/filter-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import { ExperienceEntity, ExperienceRole } from "./entities/experience.entity";
import { ExperiencesService } from "./experiences.service";

@Resolver(() => ExperienceEntity)
export class ExperiencesResolver {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Mutation(() => [ExperienceEntity])
  createExperience(
    @Args("createExperienceInput", { type: () => [CreateExperienceInput] })
    createExperienceInput: CreateExperienceInput[]
  ) {
    return this.experiencesService.create(createExperienceInput);
  }

  @Public()
  @Query(() => [ExperienceEntity])
  findAllExperiences(
    @Args("filters", { nullable: true }) filters?: FilterExperienceInput,
    @Args("pagination", { nullable: true }) pagination?: PaginationInput
  ) {
    return this.experiencesService.findAll({
      filters,
      ...pagination,
    });
  }

  @Public()
  @Query(() => ExperienceEntity)
  findOneExperienceById(@Args("id", { type: () => ID }) id: string) {
    return this.experiencesService.findOneById(id);
  }

  @Mutation(() => ExperienceEntity)
  updateExperience(
    @Args("updateExperienceInput") updateExperienceInput: UpdateExperienceInput
  ) {
    return this.experiencesService.update(
      updateExperienceInput.id,
      updateExperienceInput
    );
  }

  @Mutation(() => [ExperienceEntity])
  removeExperience(@Args("id", { type: () => ID }) id: string[]) {
    return this.experiencesService.remove(id);
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

  // group all skills from experience roles
  @ResolveField(() => [SkillEntity])
  skills(@Parent() experience: ExperienceModel, @Context() ctx: Ctx) {
    const ids = new Set<string>();

    for (const role of experience.roles) {
      if (role.skills) {
        for (const id of role.skills) {
          ids.add(id.toString());
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
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
