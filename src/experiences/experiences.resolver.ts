import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import { Experience } from "./entities/experience.entity";
import { ExperiencesService } from "./experiences.service";

@Resolver(() => Experience)
export class ExperiencesResolver {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Mutation(() => Experience)
  createExperience(
    @Args("createExperienceInput") createExperienceInput: CreateExperienceInput
  ) {
    return this.experiencesService.create(createExperienceInput);
  }

  @Query(() => [Experience], { name: "experiences" })
  findAll() {
    return this.experiencesService.findAll();
  }

  @Query(() => Experience, { name: "experience" })
  findOne(@Args("id", { type: () => ID }) id: string) {
    return this.experiencesService.findOne(id);
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

  @Mutation(() => Experience)
  removeExperience(@Args("id", { type: () => ID }) id: string) {
    return this.experiencesService.remove(id);
  }
}
