import { Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";
import { QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

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

  findOneByEmailWithPassword(email: string): Promise<UserModel> {
    return this.repository.findOneByEmailWithPassword(email);
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

  async createMany(createUserInputs: CreateUserInput[]): Promise<BatchEntity> {
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
    return this.repository.updateOneById(id, update);
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateUserInput
  ): Promise<BatchEntity> {
    const update = await this.buildUpdateQuery(updateInput);
    return this.repository.updateManyById(ids, update);
  }

  removeOne(id: string): Promise<UserModel> {
    return this.repository.deleteOneById(id);
  }

  removeMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteManyById(ids);
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
