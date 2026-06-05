import { Context, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { sortDateRange } from "@/core/helpers/daterange.helper";
import type { Ctx } from "@/core/interfaces/context.interface";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import { OrganizationEntity } from "@/organizations/entities/organization.entity";
import {
  ExperienceModel,
  ExperienceRoleModel,
} from "@/schemas/experience.schema";
import { SkillEntity } from "@/skills/entities/skill.entity";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { FilterExperienceInput } from "./dto/filter-experience.input";
import { SortExperienceInput } from "./dto/sort-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import { ExperienceEntity, ExperienceRole } from "./entities/experience.entity";
import { ExperiencesService } from "./experiences.service";

@Resolver(() => ExperienceEntity)
export class ExperiencesResolver extends BaseResolver<
  ExperienceModel,
  ExperienceEntity,
  CreateExperienceInput,
  UpdateExperienceInput,
  FilterExperienceInput,
  SortExperienceInput
>(
  ExperienceEntity,
  CreateExperienceInput,
  UpdateExperienceInput,
  FilterExperienceInput,
  SortExperienceInput
) {
  constructor(readonly experiencesService: ExperiencesService) {
    super(experiencesService);
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
