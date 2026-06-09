import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import { isNil } from "lodash";
import { Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";

@Injectable()
export class UsersService {
  private readonly repository: MongooseCrudRepository<UserModel>;

  constructor(
    @InjectModel(UserModel.name) readonly userModel: Model<UserModel>
  ) {
    this.repository = new MongooseCrudRepository(userModel);
  }

  findOneById(id: string): Promise<UserModel> {
    return this.repository.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<UserModel>;
  }): Promise<UserModel> {
    return this.repository.findOne({ filters });
  }

  async findOneByEmailWithPassword(email: string): Promise<UserModel> {
    const res = await this.userModel
      .findOne({ email })
      .select("+password")
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  findManyById(ids: string[]): Promise<UserModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany({
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
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  async createOne({
    password,
    ...createUserInput
  }: CreateUserInput): Promise<UserModel> {
    return this.repository.createOne({
      ...createUserInput,
      password: await hash(password, 8),
    });
  }

  async createMany(createUserInputs: CreateUserInput[]): Promise<UserModel[]> {
    const inputs = await Promise.all(
      createUserInputs.map(async ({ password, ...createUserInput }) => ({
        ...createUserInput,
        password: await hash(password, 8),
      }))
    );

    return this.repository.createMany(inputs);
  }

  async updateOne(
    id: string,
    updateInput: UpdateUserInput
  ): Promise<UserModel> {
    const update = await this.buildUpdateQuery(updateInput);
    return this.repository.updateOne(id, update);
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateUserInput
  ): Promise<BatchEntity> {
    const update = await this.buildUpdateQuery(updateInput);
    return this.repository.updateMany(ids, update);
  }

  removeOne(id: string): Promise<UserModel> {
    return this.repository.deleteOne(id);
  }

  removeMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteMany(ids);
  }

  private async buildUpdateQuery(
    updateInput: UpdateUserInput
  ): Promise<UpdateQuery<UserModel>> {
    const { password, ...rest } = updateInput;

    if (!password) return rest as UpdateQuery<UserModel>;

    return {
      ...rest,
      password: await hash(password, 8),
    };
  }
}
