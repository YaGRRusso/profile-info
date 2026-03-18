import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import { UserModel } from "@/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { UserEntity } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(() => UserEntity)
export class UsersResolver extends BaseResolver<
  UserModel,
  UserEntity,
  CreateUserInput,
  UpdateUserInput,
  FilterUserInput
>(UserEntity, CreateUserInput, UpdateUserInput, FilterUserInput) {
  constructor(readonly usersService: UsersService) {
    super(usersService);
  }

  @Public()
  @Mutation(() => UserEntity)
  async createOneUser(
    @Args("createUserInput", { type: () => CreateUserInput })
    createUserInput: CreateUserInput
  ): Promise<UserModel> {
    return await this.usersService.createOne(createUserInput);
  }

  @Public()
  @Mutation(() => [UserEntity])
  async createManyUsers(
    @Args("createUserInputs", { type: () => [CreateUserInput] })
    createUserInputs: CreateUserInput[]
  ): Promise<UserModel[]> {
    return await this.usersService.createMany(createUserInputs);
  }
}
