import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import { Model, QueryFilter } from "mongoose";
import { clearObject } from "@/core/helpers/object.helper";
import { Search } from "@/core/interfaces/search.interface";
import { UserModel } from "@/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
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

  async findAll({ filters, sort, skip = 0, limit = 10 }: Search<UserModel>) {
    return await this.userModel
      .find(clearObject(filters))
      .sort({ updatedAt: -1, ...clearObject(sort) })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOneById(id: string) {
    return await this.userModel.findById(id).exec();
  }

  async findOne(filters: QueryFilter<UserModel>) {
    return await this.userModel.findOne(filters).select("+password").exec();
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    return await this.userModel.findByIdAndUpdate(id, updateUserInput).exec();
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id).exec();
  }
}
