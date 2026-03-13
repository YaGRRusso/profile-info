import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import { Model } from "mongoose";
import { UserModel } from "@/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { ReadUserInput } from "./dto/read-user.input";
import { UpdateUserInput } from "./dto/update-user.input";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>
  ) {}

  async create({ password, ...createUserInput }: CreateUserInput) {
    const newHash = await hash(password, 8);
    return await this.userModel.create({
      ...createUserInput,
      password: newHash,
    });
  }

  async findAll() {
    return await this.userModel.find().exec();
  }

  async findOneById(id: string) {
    return await this.userModel.findById(id).exec();
  }

  async findOne(readUserInput: ReadUserInput) {
    return await this.userModel
      .findOne(readUserInput)
      .select("+password")
      .exec();
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    return await this.userModel.findByIdAndUpdate(id, updateUserInput).exec();
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id).exec();
  }
}
