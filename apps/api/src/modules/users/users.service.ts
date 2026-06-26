import { Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";
import { BatchEntity } from "@/core/entities/batch.entity";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { SortUserInput } from "./dto/sort-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { UserEntity } from "./entities/user.entity";
import type { UserWithPasswordEntity } from "./entities/user-with-password.entity";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  findOneById(id: string): Promise<UserEntity> {
    return this.repository.crud.findOneById(id);
  }

  findOne({ filters }: { filters?: FilterUserInput }): Promise<UserEntity> {
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
    filters?: FilterUserInput;
    sort?: SortUserInput;
    limit?: number;
    skip?: number;
  }): Promise<MultiPaged<UserEntity>> {
    return this.repository.crud.findMany({ filters, sort, skip, limit });
  }

  async createOne({
    password,
    ...createUserInput
  }: CreateUserInput): Promise<UserEntity> {
    return this.repository.crud.createOne({
      ...createUserInput,
      password: await hash(password, 8),
    } as Partial<UserEntity>);
  }

  async createMany(createUserInputs: CreateUserInput[]): Promise<BatchEntity> {
    const inputs = await Promise.all(
      createUserInputs.map(async ({ password, ...createUserInput }) => ({
        ...createUserInput,
        password: await hash(password, 8),
      }))
    );

    return this.repository.crud.createMany(inputs as Partial<UserEntity>[]);
  }

  async updateOne(
    id: string,
    updateInput: UpdateUserInput
  ): Promise<UserEntity> {
    const { password, ...rest } = updateInput;

    if (!password) {
      return this.repository.crud.updateOneById(id, rest);
    }

    return this.repository.crud.updateOneById(id, {
      ...rest,
      password: await hash(password, 8),
    } as Partial<UserEntity>);
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateUserInput
  ): Promise<BatchEntity> {
    const { password, ...rest } = updateInput;

    if (!password) {
      return this.repository.crud.updateManyById(ids, rest);
    }

    return this.repository.crud.updateManyById(ids, {
      ...rest,
      password: await hash(password, 8),
    } as Partial<UserEntity>);
  }

  removeOne(id: string): Promise<UserEntity> {
    return this.repository.crud.deleteOneById(id);
  }

  removeMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.deleteManyById(ids);
  }
}
