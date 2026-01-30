import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { Skill } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Resolver(() => Skill)
export class SkillsResolver {
  constructor(private readonly skillsService: SkillsService) {}

  @Mutation(() => [Skill])
  createSkill(
    @Args("createSkillInput", { type: () => [CreateSkillInput] })
    createSkillInput: CreateSkillInput[]
  ) {
    return this.skillsService.create(createSkillInput);
  }

  @Public()
  @Query(() => [Skill])
  findAllSkills() {
    return this.skillsService.findAll();
  }

  @Public()
  @Query(() => Skill)
  findOneSkillById(@Args("id", { type: () => ID }) id: string) {
    return this.skillsService.findOneById(id);
  }

  @Mutation(() => Skill)
  updateSkill(@Args("updateSkillInput") updateSkillInput: UpdateSkillInput) {
    return this.skillsService.update(updateSkillInput.id, updateSkillInput);
  }

  @Mutation(() => [Skill])
  removeSkill(@Args("id", { type: () => ID }) id: string[]) {
    return this.skillsService.remove(id);
  }
}
