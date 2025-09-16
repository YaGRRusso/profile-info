import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { Skill } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Resolver(() => Skill)
export class SkillsResolver {
  constructor(private readonly skillsService: SkillsService) {}

  @Mutation(() => Skill)
  createSkill(@Args("createSkillInput") createSkillInput: CreateSkillInput) {
    return this.skillsService.create(createSkillInput);
  }

  @Query(() => [Skill], { name: "skills" })
  findAll() {
    return this.skillsService.findAll();
  }

  @Query(() => Skill, { name: "skill" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.skillsService.findOne(id);
  }

  @Mutation(() => Skill)
  updateSkill(@Args("updateSkillInput") updateSkillInput: UpdateSkillInput) {
    return this.skillsService.update(updateSkillInput.id, updateSkillInput);
  }

  @Mutation(() => Skill)
  removeSkill(@Args("id", { type: () => Int }) id: number) {
    return this.skillsService.remove(id);
  }
}
