import { Resolver } from "@nestjs/graphql";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import { UserModel } from "@/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { SortUserInput } from "./dto/sort-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { UserEntity } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(() => UserEntity)
export class UsersResolver extends BaseResolver<
  UserModel,
  UserEntity,
  CreateUserInput,
  UpdateUserInput,
  FilterUserInput,
  SortUserInput
>(
  UserEntity,
  CreateUserInput,
  UpdateUserInput,
  FilterUserInput,
  SortUserInput
) {
  constructor(readonly usersService: UsersService) {
    super(usersService);
  }
}
