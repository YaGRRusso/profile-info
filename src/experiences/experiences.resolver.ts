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
import type { Ctx } from "@/core/interfaces/context.interface";
import type {
  ExperienceModel,
  ExperienceRoleModel,
} from "@/schemas/experience.schema";
import { Skill } from "@/skills/entities/skill.entity";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import { Experience, ExperienceRole } from "./entities/experience.entity";
import { ExperiencesService } from "./experiences.service";

@Resolver(() => Experience)
export class ExperiencesResolver {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Mutation(() => [Experience])
  createExperience(
    @Args("createExperienceInput", { type: () => [CreateExperienceInput] })
    createExperienceInput: CreateExperienceInput[]
  ) {
    return this.experiencesService.create(createExperienceInput);
  }

  @Public()
  @Query(() => [Experience])
  findAllExperiences() {
    return this.experiencesService.findAll();
  }

  @Public()
  @Query(() => Experience)
  findOneExperienceById(@Args("id", { type: () => ID }) id: string) {
    return this.experiencesService.findOneById(id);
  }

  @Mutation(() => Experience)
  updateExperience(
    @Args("updateExperienceInput") updateExperienceInput: UpdateExperienceInput
  ) {
    return this.experiencesService.update(
      updateExperienceInput.id,
      updateExperienceInput
    );
  }

  @Mutation(() => [Experience])
  removeExperience(@Args("id", { type: () => ID }) id: string[]) {
    return this.experiencesService.remove(id);
  }

  @ResolveField(() => [ExperienceRole])
  roles(@Parent() experience: ExperienceModel) {
    if (experience.roles) {
      return sortDateRange([...experience.roles]);
    }
  }

  // @ResolveField(() => DateRangeEntity)
  // date(@Parent() experience: ExperienceModel) {
  //   const parsed = { from: new Date(0), to: new Date(0) };

  //   for (const role of experience.roles) {
  //     if (role.date?.from) {
  //       const from = new Date(role.date.from);
  //       if (from.getTime() > parsed.from.getTime()) {
  //         parsed.from = from;
  //       }
  //     }

  //     if (role.date?.to) {
  //       const to = new Date(role.date.to);
  //       if (to.getTime() > parsed.to.getTime()) {
  //         parsed.to = to;
  //       }
  //     }
  //   }

  //   return parsed;
  // }

  @ResolveField(() => [Skill])
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
  @ResolveField(() => [Skill])
  skills(@Parent() role: ExperienceRoleModel, @Context() ctx: Ctx) {
    const ids = role.skills?.map((id) => id.toString());
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
