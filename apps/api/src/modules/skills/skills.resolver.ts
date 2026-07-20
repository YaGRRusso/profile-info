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
import type { AuthContext } from "@/core/context/auth-context.interface";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { UserEntity } from "../users/entities/user.entity";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill.input";
import { SortSkillInput } from "./dto/sort-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import {
  PaginatedSkillEntity,
  SkillEntity,
  type SkillEntityRecord,
} from "./entities/skill.entity";
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
      nullable: true,
      type: () => FilterSkillInput,
    })
    skillFilters?: FilterSkillInput
  ) {
    return this.skillsService.findOne(ctx, { filters: skillFilters });
  }

  @Query(() => SkillEntity)
  findOneActiveSkill(
    @Auth() ctx: AuthContext,
    @Args("skillFilters", {
      nullable: true,
      type: () => FilterSkillInput,
    })
    skillFilters?: FilterSkillInput
  ) {
    return this.skillsService.findOneActive(ctx, { filters: skillFilters });
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
      nullable: true,
      type: () => FilterSkillInput,
    })
    skillFilters?: FilterSkillInput,
    @Args("skillPagination", {
      nullable: true,
      type: () => PaginationInput,
    })
    skillPagination?: PaginationInput,
    @Args("skillSort", {
      nullable: true,
      type: () => SortSkillInput,
    })
    skillSort?: SortSkillInput
  ) {
    return this.skillsService.findMany(ctx, {
      filters: skillFilters,
      limit: skillPagination?.limit,
      skip: skillPagination?.skip,
      sort: skillSort,
    });
  }

  @Query(() => PaginatedSkillEntity)
  findManyActiveSkills(
    @Auth() ctx: AuthContext,
    @Args("skillFilters", {
      nullable: true,
      type: () => FilterSkillInput,
    })
    skillFilters?: FilterSkillInput,
    @Args("skillPagination", {
      nullable: true,
      type: () => PaginationInput,
    })
    skillPagination?: PaginationInput,
    @Args("skillSort", {
      nullable: true,
      type: () => SortSkillInput,
    })
    skillSort?: SortSkillInput
  ) {
    return this.skillsService.findManyActive(ctx, {
      filters: skillFilters,
      limit: skillPagination?.limit,
      skip: skillPagination?.skip,
      sort: skillSort,
    });
  }

  // MUTATIONS

  @Mutation(() => SkillEntity)
  createOneSkill(
    @Auth() ctx: AuthContext,
    @Args("createSkillInput", { type: () => CreateSkillInput })
    createSkillInput: CreateSkillInput
  ) {
    return this.skillsService.createOne(ctx, createSkillInput);
  }

  @Mutation(() => BatchEntity)
  createManySkills(
    @Auth() ctx: AuthContext,
    @Args("createSkillInputs", { type: () => [CreateSkillInput] })
    createSkillInputs: CreateSkillInput[]
  ) {
    return this.skillsService.createMany(ctx, createSkillInputs);
  }

  @Mutation(() => SkillEntity)
  updateOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string,
    @Args("updateSkillInput", { type: () => UpdateSkillInput })
    updateSkillInput: UpdateSkillInput
  ) {
    return this.skillsService.updateOne(ctx, skillId, updateSkillInput);
  }

  @Mutation(() => BatchEntity)
  updateManySkills(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[],
    @Args("updateSkillInput", { type: () => UpdateSkillInput })
    updateSkillInput: UpdateSkillInput
  ) {
    return this.skillsService.updateMany(ctx, skillIds, updateSkillInput);
  }

  @Mutation(() => SkillEntity)
  removeOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string
  ) {
    return this.skillsService.removeOne(ctx, skillId);
  }

  @Mutation(() => BatchEntity)
  removeManySkills(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[]
  ) {
    return this.skillsService.removeMany(ctx, skillIds);
  }

  @Mutation(() => SkillEntity)
  disableOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string
  ) {
    return this.skillsService.disableOne(ctx, skillId);
  }

  @Mutation(() => BatchEntity)
  disableManySkills(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[]
  ) {
    return this.skillsService.disableMany(ctx, skillIds);
  }

  @Mutation(() => SkillEntity)
  enableOneSkill(
    @Auth() ctx: AuthContext,
    @Args("skillId", { type: () => ID }) skillId: string
  ) {
    return this.skillsService.enableOne(ctx, skillId);
  }

  @Mutation(() => BatchEntity)
  enableManySkills(
    @Auth() ctx: AuthContext,
    @Args("skillIds", { type: () => [ID] }) skillIds: string[]
  ) {
    return this.skillsService.enableMany(ctx, skillIds);
  }

  @ResolveField(() => UserEntity)
  owner(@Parent() skill: SkillEntityRecord, @Context() ctx: GraphqlContext) {
    const { ownerId } = skill;
    if (!ownerId) return null;
    return ctx.loaders.batchUsers.load(ownerId);
  }
}
