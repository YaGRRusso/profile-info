import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { PaginationArgs } from "@/core/dto/pagination.args";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Mutation(() => User)
  createUser(@Args("createUserInput") createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Public()
  @Query(() => [User])
  findAllUsers(
    @Args("filters", { nullable: true }) filters?: FilterUserInput,
    @Args("pagination", { nullable: true }) pagination?: PaginationArgs
  ) {
    return this.usersService.findAll({
      filters,
      ...pagination,
    });
  }

  @Public()
  @Query(() => User)
  findOneUserById(@Args("id", { type: () => ID }) id: string) {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User)
  updateUser(@Args("updateUserInput") updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args("id", { type: () => ID }) id: string) {
    return this.usersService.remove(id);
  }
}
