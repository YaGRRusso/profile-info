import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { UserEntity } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Mutation(() => UserEntity)
  createUser(@Args("createUserInput") createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Public()
  @Query(() => [UserEntity])
  findAllUsers(
    @Args("filters", { nullable: true }) filters?: FilterUserInput,
    @Args("pagination", { nullable: true }) pagination?: PaginationInput
  ) {
    return this.usersService.findAll({
      filters,
      ...pagination,
    });
  }

  @Public()
  @Query(() => UserEntity)
  findOneUserById(@Args("id", { type: () => ID }) id: string) {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => UserEntity)
  updateUser(@Args("updateUserInput") updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => UserEntity)
  removeUser(@Args("id", { type: () => ID }) id: string) {
    return this.usersService.remove(id);
  }
}
