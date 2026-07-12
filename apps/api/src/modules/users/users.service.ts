import { ForbiddenException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { hash } from "bcryptjs";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { RegisterUserInput } from "./dto/register-user.input";
import { SortUserInput } from "./dto/sort-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import type { UserEntityRecord } from "./entities/user.entity";
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

  findOneById(id: string): Promise<UserEntityRecord> {
    return this.repository.crud.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: FilterUserInput;
  }): Promise<UserEntityRecord> {
    return this.repository.crud.findOne({ filters });
  }

  findOneByEmailWithPassword(email: string): Promise<UserWithPasswordEntity> {
    return this.repository.findOneByEmailWithPassword(email);
  }

  findManyById(ids: string[]): Promise<UserEntityRecord[]> {
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
  }): Promise<MultiPaged<UserEntityRecord>> {
    return this.repository.crud.findMany({ filters, sort, skip, limit });
  }

  async register({
    password,
    ...input
  }: RegisterUserInput): Promise<UserEntityRecord> {
    return this.repository.crud.createOne({
      ...input,
      password: await hash(password, 8),
      role: UserRole.USER,
      disabled: true,
    });
  }

  async createOne(
    ctx: AuthContext,
    { password, ...createUserInput }: CreateUserInput
  ): Promise<UserEntityRecord> {
    await this.assertSkillsExist(ctx, createUserInput.skillIds);

    return this.repository.crud.createOne({
      ...createUserInput,
      password: await hash(password, 8),
      disabled: false,
    });
  }

  async createMany(
    ctx: AuthContext,
    createUserInputs: CreateUserInput[]
  ): Promise<BatchEntity> {
    const skillIds = [
      ...new Set(createUserInputs.flatMap((item) => item.skillIds ?? [])),
    ];
    await this.assertSkillsExist(ctx, skillIds);

    const inputs: UserCreateRecord[] = await Promise.all(
      createUserInputs.map(async ({ password, ...createUserInput }) => ({
        ...createUserInput,
        password: await hash(password, 8),
        disabled: false,
      }))
    );

    return this.repository.crud.createMany(inputs);
  }

  async updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateUserInput
  ): Promise<UserEntityRecord> {
    const { password, ...rest } = updateInput;
    await this.assertSkillsExist(ctx, rest.skillIds);

    if (!password) {
      return this.repository.crud.updateOneById(id, rest);
    }

    return this.repository.crud.updateOneById(id, {
      ...rest,
      password: await hash(password, 8),
    });
  }

  async updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateUserInput
  ): Promise<BatchEntity> {
    const { password, ...rest } = updateInput;
    await this.assertSkillsExist(ctx, rest.skillIds);

    if (!password) {
      return this.repository.crud.updateManyById(ids, rest);
    }

    const update: UserUpdateRecord = {
      ...rest,
      password: await hash(password, 8),
    };

    return this.repository.crud.updateManyById(ids, update);
  }

  async removeOne(id: string): Promise<UserEntityRecord> {
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

  async detachSkill(skillId: string): Promise<void> {
    await this.repository.detachSkill(skillId);
  }

  private assertDeletable(user: UserEntityRecord): void {
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("SUPER_ADMIN users cannot be deleted");
    }
  }

  private assertSkillsExist(
    ctx: AuthContext,
    skillIds?: string[]
  ): Promise<void> {
    if (skillIds === undefined) return Promise.resolve();
    return this.skillsValidator.assertSkillsEnabled(ctx, skillIds);
  }
}
