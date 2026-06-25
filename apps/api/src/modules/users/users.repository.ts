import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { Model } from "mongoose";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import type { UserEntity } from "./entities/user.entity";
import type { UserWithPasswordEntity } from "./entities/user-with-password.entity";
import { toUserEntity } from "./mappers/user.mapper";
import { UserModel } from "./schemas/user.schema";

@Injectable()
export class UsersRepository extends CrudRepository<UserModel, UserEntity> {
  constructor(@InjectModel(UserModel.name) model: Model<UserModel>) {
    super(model);
  }

  protected toEntity(model: UserModel): UserEntity {
    return toUserEntity(model);
  }

  async findOneByEmailWithPassword(
    email: string
  ): Promise<UserWithPasswordEntity> {
    const document = await this.model
      .findOne({ email })
      .select("+password")
      .exec();

    if (isNil(document)) throw new NotFoundException(PERSISTENCE_NOT_FOUND);

    return {
      ...this.toEntity(document),
      password: document.password,
    };
  }
}
