import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { FilterUserInput } from "./dto/filter-user.input";
import { SortUserInput } from "./dto/sort-user.input";
import type { UserEntityRecord } from "./entities/user.entity";
import type { UserWithPasswordEntity } from "./entities/user-with-password.entity";
import {
  type UserCreateRecord,
  UserMapper,
  type UserUpdateRecord,
} from "./mappers/user.mapper";
import { UserModel } from "./schemas/user.schema";

@Injectable()
export class UsersRepository {
  private readonly mapper = new UserMapper();
  readonly crud: CrudRepository<
    UserModel,
    UserEntityRecord,
    UserCreateRecord,
    UserUpdateRecord,
    FilterUserInput,
    SortUserInput
  >;

  constructor(
    @InjectModel(UserModel.name) private readonly model: Model<UserModel>
  ) {
    this.crud = new CrudRepository(this.model, this.mapper);
  }

  async findOneByEmailWithPassword(
    email: string
  ): Promise<UserWithPasswordEntity | null> {
    const document = await this.model
      .findOne({ email })
      .select("+password")
      .exec();

    if (isNil(document)) return null;

    return {
      ...this.mapper.toDomain(document),
      password: document.password,
    };
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.model
      .updateMany({ skillIds: skillId }, { $pull: { skillIds: skillId } })
      .exec();
  }
}
