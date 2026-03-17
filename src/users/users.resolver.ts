import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { UserEntity } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // QUERIES

  @Public()
  @Query(() => UserEntity)
  findOneUserById(@Args("id", { type: () => ID }) id: string) {
    return this.usersService.findOneById(id);
  }

  @Public()
  @Query(() => UserEntity)
  findOneUser(
    @Args("filters", {
      type: () => FilterUserInput,
      nullable: true,
    })
    filters?: FilterUserInput
  ) {
    return this.usersService.findOne(filters);
  }

  @Public()
  @Query(() => [UserEntity])
  findManyUserById(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.usersService.findManyById(ids);
  }

  @Public()
  @Query(() => [UserEntity])
  findManyUsers(
    @Args("filters", {
      type: () => FilterUserInput,
      nullable: true,
    })
    filters?: FilterUserInput,
    @Args("pagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput
  ) {
    return this.usersService.findMany({
      filters,
      ...pagination,
    });
  }

  // MUTATIONS

  @Public()
  @Mutation(() => UserEntity)
  createOneUser(
    @Args("createUserInput", { type: () => CreateUserInput })
    createUserInput: CreateUserInput
  ) {
    return this.usersService.createOne(createUserInput);
  }

  @Public()
  @Mutation(() => [UserEntity])
  createManyUsers(
    @Args("createUserInputs", { type: () => [CreateUserInput] })
    createUserInputs: CreateUserInput[]
  ) {
    return this.usersService.createMany(createUserInputs);
  }

  @Mutation(() => UserEntity)
  updateOneUser(
    @Args("id", { type: () => ID }) id: string,
    @Args("updateUserInput", { type: () => UpdateUserInput })
    updateUserInput: UpdateUserInput
  ) {
    return this.usersService.updateOne(id, updateUserInput);
  }

  @Mutation(() => BatchEntity)
  updateManyUsers(
    @Args("ids", { type: () => [ID] }) ids: string[],
    @Args("updateUserInput", { type: () => UpdateUserInput })
    updateUserInput: UpdateUserInput
  ) {
    return this.usersService.updateMany(ids, updateUserInput);
  }

  @Mutation(() => UserEntity)
  removeOneUser(@Args("id", { type: () => ID }) id: string) {
    return this.usersService.removeOne(id);
  }

  @Mutation(() => BatchEntity)
  removeManyUsers(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.usersService.removeMany(ids);
  }
}
