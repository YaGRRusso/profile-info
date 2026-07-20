import { ForbiddenException } from "@nestjs/common";
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
import { i18nKey } from "@/core/i18n/i18n";
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
import { UserOwnedCounts } from "./entities/user-owned-counts.entity";
import { UsersService } from "./users.service";

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // QUERIES

  @Query(() => UserEntity)
  findOneUserById(@Args("userId", { type: () => ID }) userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Query(() => UserEntity)
  findOneUser(
    @Args("userFilters", {
      nullable: true,
      type: () => FilterUserInput,
    })
    userFilters?: FilterUserInput
  ) {
    return this.usersService.findOne({ filters: userFilters });
  }

  @Query(() => [UserEntity])
  findManyUserById(@Args("userIds", { type: () => [ID] }) userIds: string[]) {
    return this.usersService.findManyById(userIds);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Query(() => PaginatedUserEntity)
  findManyUsers(
    @Args("userFilters", {
      nullable: true,
      type: () => FilterUserInput,
    })
    userFilters?: FilterUserInput,
    @Args("userPagination", {
      nullable: true,
      type: () => PaginationInput,
    })
    userPagination?: PaginationInput,
    @Args("userSort", {
      nullable: true,
      type: () => SortUserInput,
    })
    userSort?: SortUserInput
  ) {
    return this.usersService.findMany({
      filters: userFilters,
      limit: userPagination?.limit,
      skip: userPagination?.skip,
      sort: userSort,
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
    const { id, skillIds } = user;
    if (!skillIds?.length) return [];
    return ctx.loaders.batchSkills.forKey(id).loadMany(skillIds);
  }

  @ResolveField(() => UserOwnedCounts)
  ownedCounts(
    @Auth() auth: AuthContext,
    @Parent() user: UserEntityRecord,
    @Context() ctx: GraphqlContext
  ) {
    if (auth.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        i18nKey("auth.INSUFFICIENT_PERMISSIONS", {
          roles: UserRole.SUPER_ADMIN,
        })
      );
    }
    return ctx.loaders.batchUserOwnedCounts.load(user.id);
  }
}
