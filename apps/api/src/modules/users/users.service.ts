import { Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { UserEntity } from "./entities/user.entity";
import type { UserWithPasswordEntity } from "./entities/user-with-password.entity";
import { UserModel } from "./schemas/user.schema";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  findOneById(id: string): Promise<UserEntity> {
    return this.repository.crud.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<UserModel>;
  }): Promise<UserEntity> {
    return this.repository.crud.findOne({ filters });
  }

  findOneByEmailWithPassword(email: string): Promise<UserWithPasswordEntity> {
    return this.repository.findOneByEmailWithPassword(email);
  }

  findManyById(ids: string[]): Promise<UserEntity[]> {
    return this.repository.crud.findManyById(ids);
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
  }): Promise<PaginatedModel<UserEntity>> {
    return this.repository.crud.findMany({ filters, sort, skip, limit });
  }

  async createOne({
    password,
    ...createUserInput
  }: CreateUserInput): Promise<UserEntity> {
    return this.repository.crud.createOne({
      ...createUserInput,
      password: await hash(password, 8),
    } as AnyKeys<UserModel>);
  }

  async createMany(createUserInputs: CreateUserInput[]): Promise<BatchEntity> {
    const inputs = await Promise.all(
      createUserInputs.map(async ({ password, ...createUserInput }) => ({
        ...createUserInput,
        password: await hash(password, 8),
      }))
    );

    return this.repository.crud.createMany(inputs as AnyKeys<UserModel>[]);
  }

  async updateOne(
    id: string,
    updateInput: UpdateUserInput
  ): Promise<UserEntity> {
    const update = await this.buildUpdateQuery(updateInput);
    return this.repository.crud.updateOneById(id, update);
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateUserInput
  ): Promise<BatchEntity> {
    const update = await this.buildUpdateQuery(updateInput);
    return this.repository.crud.updateManyById(ids, update);
  }

  removeOne(id: string): Promise<UserEntity> {
    return this.repository.crud.deleteOneById(id);
  }

  removeMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.deleteManyById(ids);
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
