import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import { isNil } from "lodash";
import { Model, QueryFilter } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
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

  // QUERIES

  async findOneById(id: string): Promise<UserModel> {
    const res = await this.userModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne(filters?: QueryFilter<UserModel>): Promise<UserModel> {
    const res = await this.userModel
      .findOne(clearObject(filters))
      .select("+password")
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<UserModel[]> {
    const res = await this.userModel.find({ _id: { $in: ids } }).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<UserModel>): Promise<UserModel[]> {
    const res = await this.userModel
      .find(clearObject(filters))
      .sort({ updatedAt: -1, ...clearObject(sort) })
      .skip(skip)
      .limit(limit)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  // MUTATIONS

  async createOne({
    password,
    ...createUserInput
  }: CreateUserInput): Promise<UserModel> {
    const newHash = await hash(password, 8);
    const res = await this.userModel.create({
      ...createUserInput,
      password: newHash,
    });

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(createUserInputs: CreateUserInput[]): Promise<UserModel[]> {
    const inputs = await Promise.all(
      createUserInputs.map(async (input) => ({
        ...input,
        password: await hash(input.password, 8),
      }))
    );
    const res = await this.userModel.create(inputs);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateUserInput: UpdateUserInput
  ): Promise<UserModel> {
    const res = await this.userModel
      .findByIdAndUpdate(id, updateUserInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateUserInput: UpdateUserInput
  ): Promise<BatchEntity> {
    const res = await this.userModel
      .updateMany({ _id: { $in: ids } }, updateUserInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<UserModel> {
    const res = await this.userModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const res = await this.userModel.deleteMany({ _id: { $in: ids } }).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
