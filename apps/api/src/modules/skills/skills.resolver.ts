import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill.input";
import { SortSkillInput } from "./dto/sort-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { PaginatedSkillEntity, SkillEntity } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Resolver(() => SkillEntity)
export class SkillsResolver {
  constructor(private readonly skillsService: SkillsService) {}

  // QUERIES

  @Public()
  @Query(() => SkillEntity)
  findOneSkillById(@Args("skillId", { type: () => ID }) skillId: string) {
    return this.skillsService.findOneById(skillId);
  }

  @Public()
  @Query(() => SkillEntity)
  findOneSkill(
    @Args("skillFilters", {
      type: () => FilterSkillInput,
      nullable: true,
    })
    skillFilters?: FilterSkillInput
  ) {
    return this.skillsService.findOne({ filters: skillFilters });
  }

  @Public()
  @Query(() => [SkillEntity])
  findManySkillById(
    @Args("skillIds", { type: () => [ID] }) skillIds: string[]
  ) {
    return this.skillsService.findManyById(skillIds);
  }

  @Public()
  @Query(() => PaginatedSkillEntity)
  findManySkills(
    @Args("skillFilters", {
      type: () => FilterSkillInput,
      nullable: true,
    })
    skillFilters?: FilterSkillInput,
    @Args("skillPagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    skillPagination?: PaginationInput,
    @Args("skillSort", {
      type: () => SortSkillInput,
      nullable: true,
    })
    skillSort?: SortSkillInput
  ) {
    return this.skillsService.findMany({
      filters: skillFilters,
      sort: skillSort,
      limit: skillPagination?.limit,
      skip: skillPagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.ADMIN)
  @Mutation(() => SkillEntity)
  createOneSkill(
    @Args("createSkillInput", { type: () => CreateSkillInput })
    createSkillInput: CreateSkillInput
  ) {
    return this.skillsService.createOne(createSkillInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => [SkillEntity])
  createManySkills(
    @Args("createSkillInputs", { type: () => [CreateSkillInput] })
    createSkillInputs: CreateSkillInput[]
  ) {
    return this.skillsService.createMany(createSkillInputs);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => SkillEntity)
  updateOneSkill(
    @Args("skillId", { type: () => ID }) skillId: string,
    @Args("updateSkillInput", { type: () => UpdateSkillInput })
    updateSkillInput: UpdateSkillInput
  ) {
    return this.skillsService.updateOne(skillId, updateSkillInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => BatchEntity)
  updateManySkills(
    @Args("skillIds", { type: () => [ID] }) skillIds: string[],
    @Args("updateSkillInput", { type: () => UpdateSkillInput })
    updateSkillInput: UpdateSkillInput
  ) {
    return this.skillsService.updateMany(skillIds, updateSkillInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => SkillEntity)
  removeOneSkill(@Args("skillId", { type: () => ID }) skillId: string) {
    return this.skillsService.removeOne(skillId);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => BatchEntity)
  removeManySkills(@Args("skillIds", { type: () => [ID] }) skillIds: string[]) {
    return this.skillsService.removeMany(skillIds);
  }
}
