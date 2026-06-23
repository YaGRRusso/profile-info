import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { UserModel } from "./schemas/user.schema";

@Injectable()
export class UsersRepository extends CrudRepository<UserModel> {
  constructor(@InjectModel(UserModel.name) userModel: Model<UserModel>) {
    super(userModel);
  }

  async findOneByEmailWithPassword(email: string): Promise<UserModel> {
    const res = await this.model.findOne({ email }).select("+password").exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }
}
