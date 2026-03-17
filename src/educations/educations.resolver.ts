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
import type { Ctx } from "@/core/interfaces/context.interface";
import { Organization } from "@/organizations/entities/organization.entity";
import type { EducationModel } from "@/schemas/education.schema";
import { Skill } from "@/skills/entities/skill.entity";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsService } from "./educations.service";
import { Education } from "./entities/education.entity";

@Resolver(() => Education)
export class EducationsResolver {
  constructor(private readonly educationsService: EducationsService) {}

  @Mutation(() => [Education])
  createEducation(
    @Args("createEducationInput", { type: () => [CreateEducationInput] })
    createEducationInput: CreateEducationInput[]
  ) {
    return this.educationsService.create(createEducationInput);
  }

  @Public()
  @Query(() => [Education])
  findAllEducations() {
    return this.educationsService.findAll({});
  }

  @Public()
  @Query(() => Education)
  findOneEducationById(@Args("id", { type: () => ID }) id: string) {
    return this.educationsService.findOneById(id);
  }

  @Mutation(() => Education)
  updateEducation(
    @Args("updateEducationInput") updateEducationInput: UpdateEducationInput
  ) {
    return this.educationsService.update(
      updateEducationInput.id,
      updateEducationInput
    );
  }

  @Mutation(() => [Education])
  removeEducation(@Args("id", { type: () => ID }) id: string[]) {
    return this.educationsService.remove(id);
  }

  @ResolveField(() => Organization)
  organization(@Parent() education: EducationModel, @Context() ctx: Ctx) {
    if (!education?.organization) return null;
    return ctx.loaders.batchOrganizations.load(
      education.organization.toString()
    );
  }

  @ResolveField(() => [Skill])
  skills(@Parent() education: EducationModel, @Context() ctx: Ctx) {
    const ids = education.skills?.map((id) => id.toString());
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
