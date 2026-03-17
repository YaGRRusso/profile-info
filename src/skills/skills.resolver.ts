import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill-input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { SkillEntity } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Resolver(() => SkillEntity)
export class SkillsResolver {
  constructor(private readonly skillsService: SkillsService) {}

  @Mutation(() => [SkillEntity])
  createSkill(
    @Args("createSkillInput", { type: () => [CreateSkillInput] })
    createSkillInput: CreateSkillInput[]
  ) {
    return this.skillsService.create(createSkillInput);
  }

  @Public()
  @Query(() => [SkillEntity])
  findAllSkills(
    @Args("filters", { nullable: true }) filters?: FilterSkillInput,
    @Args("pagination", { nullable: true }) pagination?: PaginationInput
  ) {
    return this.skillsService.findAll({
      filters,
      ...pagination,
    });
  }

  @Public()
  @Query(() => SkillEntity)
  findOneSkillById(@Args("id", { type: () => ID }) id: string) {
    return this.skillsService.findOneById(id);
  }

  @Mutation(() => SkillEntity)
  updateSkill(@Args("updateSkillInput") updateSkillInput: UpdateSkillInput) {
    return this.skillsService.update(updateSkillInput.id, updateSkillInput);
  }

  @Mutation(() => [SkillEntity])
  removeSkill(@Args("id", { type: () => ID }) id: string[]) {
    return this.skillsService.remove(id);
  }
}
