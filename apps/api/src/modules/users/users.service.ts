import { ForbiddenException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { hash } from "bcryptjs";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { SortUserInput } from "./dto/sort-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { UserEntity } from "./entities/user.entity";
import type { UserWithPasswordEntity } from "./entities/user-with-password.entity";
import type { UserCreateRecord, UserUpdateRecord } from "./mappers/user.mapper";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly skillsValidator: SkillsValidatorService
  ) {}

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
    await this.assertSkillsExist(createUserInput.skillIds);

    return this.repository.crud.createOne({
      ...createUserInput,
      password: await hash(password, 8),
    });
  }

  async createMany(createUserInputs: CreateUserInput[]): Promise<BatchEntity> {
    const skillIds = [
      ...new Set(createUserInputs.flatMap((item) => item.skillIds ?? [])),
    ];
    await this.assertSkillsExist(skillIds);

    const inputs: UserCreateRecord[] = await Promise.all(
      createUserInputs.map(async ({ password, ...createUserInput }) => ({
        ...createUserInput,
        password: await hash(password, 8),
      }))
    );

    return this.repository.crud.createMany(inputs);
  }

  async updateOne(
    id: string,
    updateInput: UpdateUserInput
  ): Promise<UserEntity> {
    const { password, ...rest } = updateInput;
    await this.assertSkillsExist(rest.skillIds);

    if (!password) {
      return this.repository.crud.updateOneById(id, rest);
    }

    return this.repository.crud.updateOneById(id, {
      ...rest,
      password: await hash(password, 8),
    });
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateUserInput
  ): Promise<BatchEntity> {
    const { password, ...rest } = updateInput;
    await this.assertSkillsExist(rest.skillIds);

    if (!password) {
      return this.repository.crud.updateManyById(ids, rest);
    }

    const update: UserUpdateRecord = {
      ...rest,
      password: await hash(password, 8),
    };

    return this.repository.crud.updateManyById(ids, update);
  }

  async removeOne(id: string): Promise<UserEntity> {
    const user = await this.repository.crud.findOneById(id);

    this.assertDeletable(user);

    await this.eventEmitter.emitAsync(
      DomainEvents.user.deleted,
      new UserDeletedEvent(user.id)
    );

    await this.repository.crud.deleteOneById(id);
    return user;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const users = await this.repository.crud.findManyById(ids);

    for (const user of users) {
      this.assertDeletable(user);
    }

    for (const user of users) {
      await this.eventEmitter.emitAsync(
        DomainEvents.user.deleted,
        new UserDeletedEvent(user.id)
      );
    }

    return this.repository.crud.deleteManyById(ids);
  }

  private assertDeletable(user: UserEntity): void {
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("SUPER_ADMIN users cannot be deleted");
    }
  }

  private assertSkillsExist(skillIds?: string[]): Promise<void> {
    if (skillIds === undefined) return Promise.resolve();
    return this.skillsValidator.assertSkillsExist(skillIds);
  }
}
