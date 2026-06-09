import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { SortUserInput } from "./dto/sort-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { PaginatedUserEntity, UserEntity } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // QUERIES

  @Public()
  @Query(() => UserEntity)
  findOneUserById(@Args("userId", { type: () => ID }) userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Public()
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

  @Public()
  @Query(() => [UserEntity])
  findManyUserById(@Args("userIds", { type: () => [ID] }) userIds: string[]) {
    return this.usersService.findManyById(userIds);
  }

  @Public()
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

  @Roles(UserRole.ADMIN)
  @Mutation(() => UserEntity)
  createOneUser(
    @Args("createUserInput", { type: () => CreateUserInput })
    createUserInput: CreateUserInput
  ) {
    return this.usersService.createOne(createUserInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => [UserEntity])
  createManyUsers(
    @Args("createUserInputs", { type: () => [CreateUserInput] })
    createUserInputs: CreateUserInput[]
  ) {
    return this.usersService.createMany(createUserInputs);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => UserEntity)
  updateOneUser(
    @Args("userId", { type: () => ID }) userId: string,
    @Args("updateUserInput", { type: () => UpdateUserInput })
    updateUserInput: UpdateUserInput
  ) {
    return this.usersService.updateOne(userId, updateUserInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => BatchEntity)
  updateManyUsers(
    @Args("userIds", { type: () => [ID] }) userIds: string[],
    @Args("updateUserInput", { type: () => UpdateUserInput })
    updateUserInput: UpdateUserInput
  ) {
    return this.usersService.updateMany(userIds, updateUserInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => UserEntity)
  removeOneUser(@Args("userId", { type: () => ID }) userId: string) {
    return this.usersService.removeOne(userId);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => BatchEntity)
  removeManyUsers(@Args("userIds", { type: () => [ID] }) userIds: string[]) {
    return this.usersService.removeMany(userIds);
  }
}
