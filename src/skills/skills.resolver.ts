import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill-input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { SkillEntity } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Resolver(() => SkillEntity)
export class SkillsResolver {
  constructor(private readonly skillsService: SkillsService) {}

  // QUERIES

  @Public()
  @Query(() => SkillEntity)
  findOneSkillById(@Args("id", { type: () => ID }) id: string) {
    return this.skillsService.findOneById(id);
  }

  @Public()
  @Query(() => SkillEntity)
  findOneSkill(
    @Args("filters", {
      type: () => FilterSkillInput,
      nullable: true,
    })
    filters?: FilterSkillInput
  ) {
    return this.skillsService.findOne({ filters });
  }

  @Public()
  @Query(() => [SkillEntity])
  findManySkillById(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.skillsService.findManyById(ids);
  }

  @Public()
  @Query(() => [SkillEntity])
  findManySkills(
    @Args("filters", {
      type: () => FilterSkillInput,
      nullable: true,
    })
    filters?: FilterSkillInput,
    @Args("pagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput
  ) {
    return this.skillsService.findMany({
      filters,
      ...pagination,
    });
  }

  // MUTATIONS

  @Mutation(() => SkillEntity)
  createOneSkill(
    @Args("createSkillInput", { type: () => CreateSkillInput })
    createSkillInput: CreateSkillInput
  ) {
    return this.skillsService.createOne(createSkillInput);
  }

  @Mutation(() => [SkillEntity])
  createManySkills(
    @Args("createSkillInputs", { type: () => [CreateSkillInput] })
    createSkillInputs: CreateSkillInput[]
  ) {
    return this.skillsService.createMany(createSkillInputs);
  }

  @Mutation(() => SkillEntity)
  updateOneSkill(
    @Args("id", { type: () => ID }) id: string,
    @Args("updateSkillInput", { type: () => UpdateSkillInput })
    updateSkillInput: UpdateSkillInput
  ) {
    return this.skillsService.updateOne(id, updateSkillInput);
  }

  @Mutation(() => BatchEntity)
  updateManySkills(
    @Args("ids", { type: () => [ID] }) ids: string[],
    @Args("updateSkillInput", { type: () => UpdateSkillInput })
    updateSkillInput: UpdateSkillInput
  ) {
    return this.skillsService.updateMany(ids, updateSkillInput);
  }

  @Mutation(() => SkillEntity)
  removeOneSkill(@Args("id", { type: () => ID }) id: string) {
    return this.skillsService.removeOne(id);
  }

  @Mutation(() => BatchEntity)
  removeManySkills(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.skillsService.removeMany(ids);
  }
}
