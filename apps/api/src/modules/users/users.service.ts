import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import { isNil } from "lodash";
import { Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name) readonly userModel: Model<UserModel>
  ) {}

  async findOneById(id: string): Promise<UserModel> {
    assertValidObjectId(id);

    const res = await this.userModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<UserModel>;
  }): Promise<UserModel> {
    const res = await this.userModel
      .findOne(clearObject(filters) as QueryFilter<UserModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOneByEmailWithPassword(email: string): Promise<UserModel> {
    const res = await this.userModel
      .findOne({ email })
      .select("+password")
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<UserModel[]> {
    assertValidObjectIds(ids);

    const res = await this.userModel
      .find({ _id: { $in: ids } } as QueryFilter<UserModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: QueryFilter<UserModel>;
    sort?: Partial<Record<keyof UserModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<UserModel>> {
    const nodes = await this.userModel
      .find(clearObject(filters) as QueryFilter<UserModel>)
      .sort(clearObject(sort) as Record<keyof UserModel, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.userModel
      .countDocuments(clearObject(filters) as QueryFilter<UserModel>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return {
      nodes,
      found,
    };
  }

  async createOne({
    password,
    ...createUserInput
  }: CreateUserInput): Promise<UserModel> {
    const input = {
      ...createUserInput,
      password: await hash(password, 8),
    };

    const res = await this.userModel.create(input);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(createUserInputs: CreateUserInput[]): Promise<UserModel[]> {
    const inputs = await Promise.all(
      createUserInputs.map(async ({ password, ...createUserInput }) => ({
        ...createUserInput,
        password: await hash(password, 8),
      }))
    );

    const res = await this.userModel.create(inputs);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateInput: UpdateUserInput
  ): Promise<UserModel> {
    assertValidObjectId(id);

    const res = await this.userModel
      .findByIdAndUpdate(id, updateInput as object as UpdateQuery<UserModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateUserInput
  ): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const res = await this.userModel
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<UserModel>,
        updateInput as object as UpdateQuery<UserModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<UserModel> {
    assertValidObjectId(id);

    const res = await this.userModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const res = await this.userModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<UserModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
