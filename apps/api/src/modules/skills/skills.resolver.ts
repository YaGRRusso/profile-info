import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
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

  @Query(() => SkillEntity)
  findOneSkillById(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string
  ) {
    return this.skillsService.findOneById(ctx, skillId);
  }

  @Query(() => SkillEntity)
  findOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillFilters", {
      type: () => FilterSkillInput,
      nullable: true,
    })
    skillFilters?: FilterSkillInput
  ) {
    return this.skillsService.findOne(ctx, { filters: skillFilters });
  }

  @Query(() => [SkillEntity])
  findManySkillById(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[]
  ) {
    return this.skillsService.findManyById(ctx, skillIds);
  }

  @Query(() => PaginatedSkillEntity)
  findManySkills(
    @Auth() ctx: AuthContext,
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
    return this.skillsService.findMany(ctx, {
      filters: skillFilters,
      sort: skillSort,
      limit: skillPagination?.limit,
      skip: skillPagination?.skip,
    });
  }

  @Query(() => PaginatedSkillEntity)
  findManyActiveSkills(
    @Auth() ctx: AuthContext,
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
    return this.skillsService.findManyActive(ctx, {
      filters: skillFilters,
      sort: skillSort,
      limit: skillPagination?.limit,
      skip: skillPagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => SkillEntity)
  createOneSkill(
    @Auth() ctx: AuthContext,
    @Args("createSkillInput", { type: () => CreateSkillInput })
    createSkillInput: CreateSkillInput
  ) {
    return this.skillsService.createOne(ctx, createSkillInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  createManySkills(
    @Auth() ctx: AuthContext,
    @Args("createSkillInputs", { type: () => [CreateSkillInput] })
    createSkillInputs: CreateSkillInput[]
  ) {
    return this.skillsService.createMany(ctx, createSkillInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => SkillEntity)
  updateOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string,
    @Args("updateSkillInput", { type: () => UpdateSkillInput })
    updateSkillInput: UpdateSkillInput
  ) {
    return this.skillsService.updateOne(ctx, skillId, updateSkillInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  updateManySkills(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[],
    @Args("updateSkillInput", { type: () => UpdateSkillInput })
    updateSkillInput: UpdateSkillInput
  ) {
    return this.skillsService.updateMany(ctx, skillIds, updateSkillInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => SkillEntity)
  removeOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string
  ) {
    return this.skillsService.removeOne(ctx, skillId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManySkills(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[]
  ) {
    return this.skillsService.removeMany(ctx, skillIds);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => SkillEntity)
  disableOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string
  ) {
    return this.skillsService.disableOne(ctx, skillId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  disableManySkills(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[]
  ) {
    return this.skillsService.disableMany(ctx, skillIds);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => SkillEntity)
  enableOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string
  ) {
    return this.skillsService.enableOne(ctx, skillId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  enableManySkills(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[]
  ) {
    return this.skillsService.enableMany(ctx, skillIds);
  }
}
