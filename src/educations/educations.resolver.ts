import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsService } from "./educations.service";
import { Education } from "./entities/education.entity";

@Resolver(() => Education)
export class EducationsResolver {
  constructor(private readonly educationsService: EducationsService) {}

  @Mutation(() => Education)
  createEducation(
    @Args("createEducationInput") createEducationInput: CreateEducationInput
  ) {
    return this.educationsService.create(createEducationInput);
  }

  @Query(() => [Education], { name: "educations" })
  findAll() {
    return this.educationsService.findAll();
  }

  @Query(() => Education, { name: "education" })
  findOne(@Args("id", { type: () => ID }) id: string) {
    return this.educationsService.findOne(id);
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

  @Mutation(() => Education)
  removeEducation(@Args("id", { type: () => ID }) id: string) {
    return this.educationsService.remove(id);
  }
}
