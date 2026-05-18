import { Context, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import type { Ctx } from "@/core/interfaces/context.interface";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import { OrganizationEntity } from "@/organizations/entities/organization.entity";
import { EducationModel } from "@/schemas/education.schema";
import { SkillEntity } from "@/skills/entities/skill.entity";
import { CreateEducationInput } from "./dto/create-education.input";
import { FilterEducationInput } from "./dto/filter-education.input";
import { SortEducationInput } from "./dto/sort-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsService } from "./educations.service";
import { EducationEntity } from "./entities/education.entity";

@Resolver(() => EducationEntity)
export class EducationsResolver extends BaseResolver<
  EducationModel,
  EducationEntity,
  CreateEducationInput,
  UpdateEducationInput,
  FilterEducationInput,
  SortEducationInput
>(
  EducationEntity,
  CreateEducationInput,
  UpdateEducationInput,
  FilterEducationInput,
  SortEducationInput
) {
  constructor(readonly educationsService: EducationsService) {
    super(educationsService);
  }

  @ResolveField(() => OrganizationEntity)
  organization(@Parent() education: EducationModel, @Context() ctx: Ctx) {
    if (!education?.organization) return null;
    return ctx.loaders.batchOrganizations.load(
      education.organization.toString()
    );
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() education: EducationModel, @Context() ctx: Ctx) {
    const ids = education.skills?.map((id) => id.toString());
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
