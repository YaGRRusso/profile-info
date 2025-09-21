import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserModel } from "@/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { ReadUserInput } from "./dto/read-user.input";
import { UpdateUserInput } from "./dto/update-user.input";

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModel.name) private readonly userModel: Model<UserModel>) {}

  create(createUserInput: CreateUserInput) {
    return this.userModel.create(createUserInput);
  }

  findAll() {
    return this.userModel.find().select("-password").exec();
  }

  findOneById(id: string) {
    return this.userModel.findById(id).select("-password").exec();
  }

  findOne(readUserInput: ReadUserInput) {
    return this.userModel.findOne(readUserInput).select("-password").exec();
  }

  update(id: string, updateUserInput: UpdateUserInput) {
    return this.userModel.findByIdAndUpdate(id, updateUserInput).exec();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
