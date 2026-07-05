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
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { SortUserInput } from "./dto/sort-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import {
  PaginatedUserEntity,
  UserEntity,
  type UserEntityRecord,
} from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // QUERIES

  @Query(() => UserEntity)
  findOneUserById(@Args("userId", { type: () => ID }) userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Query(() => UserEntity)
  findOneUser(
    @Args("userFilters", {
      type: () => FilterUserInput,
      nullable: true,
    })
    userFilters?: FilterUserInput
  ) {
    return this.usersService.findOne({ filters: userFilters });
  }

  @Query(() => [UserEntity])
  findManyUserById(@Args("userIds", { type: () => [ID] }) userIds: string[]) {
    return this.usersService.findManyById(userIds);
  }

  @Query(() => PaginatedUserEntity)
  findManyUsers(
    @Args("userFilters", {
      type: () => FilterUserInput,
      nullable: true,
    })
    userFilters?: FilterUserInput,
    @Args("userPagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    userPagination?: PaginationInput,
    @Args("userSort", {
      type: () => SortUserInput,
      nullable: true,
    })
    userSort?: SortUserInput
  ) {
    return this.usersService.findMany({
      filters: userFilters,
      sort: userSort,
      limit: userPagination?.limit,
      skip: userPagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => UserEntity)
  createOneUser(
    @Auth() ctx: AuthContext,
    @Args("createUserInput", { type: () => CreateUserInput })
    createUserInput: CreateUserInput
  ) {
    return this.usersService.createOne(ctx, createUserInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  createManyUsers(
    @Auth() ctx: AuthContext,
    @Args("createUserInputs", { type: () => [CreateUserInput] })
    createUserInputs: CreateUserInput[]
  ) {
    return this.usersService.createMany(ctx, createUserInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => UserEntity)
  updateOneUser(
    @Auth() ctx: AuthContext,
    @Args("userId", { type: () => ID }) userId: string,
    @Args("updateUserInput", { type: () => UpdateUserInput })
    updateUserInput: UpdateUserInput
  ) {
    return this.usersService.updateOne(ctx, userId, updateUserInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  updateManyUsers(
    @Auth() ctx: AuthContext,
    @Args("userIds", { type: () => [ID] }) userIds: string[],
    @Args("updateUserInput", { type: () => UpdateUserInput })
    updateUserInput: UpdateUserInput
  ) {
    return this.usersService.updateMany(ctx, userIds, updateUserInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => UserEntity)
  removeOneUser(@Args("userId", { type: () => ID }) userId: string) {
    return this.usersService.removeOne(userId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManyUsers(@Args("userIds", { type: () => [ID] }) userIds: string[]) {
    return this.usersService.removeMany(userIds);
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() user: UserEntityRecord, @Context() ctx: GraphqlContext) {
    const ids = user.skillIds;
    if (!ids?.length) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
