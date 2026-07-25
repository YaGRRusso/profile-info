import { ForbiddenException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { hash } from "bcryptjs";
import { uniq } from "lodash";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { Locale } from "@/core/enums/locale.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { DomainEvents } from "@/core/events/domain-events";
import { UserAccountEnabledEvent } from "@/core/events/user-account-enabled.event";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { UserRegisteredEvent } from "@/core/events/user-registered.event";
import { i18nKey } from "@/core/i18n/i18n";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { CreateUserInput } from "./dto/create-user.input";
import { FilterUserInput } from "./dto/filter-user.input";
import { RegisterUserInput } from "./dto/register-user.input";
import { SortUserInput } from "./dto/sort-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import type { UserEntityRecord } from "./entities/user.entity";
import type { UserWithPasswordEntity } from "./entities/user-with-password.entity";
import { assertPreferredLocaleInLocales } from "./helpers/assert-preferred-locale-in-locales.helper";
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

  findOneByEmailWithPassword(
    email: string
  ): Promise<UserWithPasswordEntity | null> {
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
    return this.repository.crud.findMany({ filters, limit, skip, sort });
  }

  async register({
    password,
    ...input
  }: RegisterUserInput): Promise<UserEntityRecord> {
    const locales = input.locales ?? [input.locale];
    assertPreferredLocaleInLocales(input.locale, locales);

    const user = await this.repository.crud.createOne({
      ...input,
      disabled: true,
      locales,
      password: await hash(password, 8),
      role: UserRole.USER,
    });

    await this.eventEmitter.emitAsync(
      DomainEvents.user.registered,
      new UserRegisteredEvent(user.id, user.email, user.name)
    );

    return user;
  }

  async createOne(
    ctx: AuthContext,
    { password, ...createUserInput }: CreateUserInput
  ): Promise<UserEntityRecord> {
    await this.assertSkillsExist(ctx, createUserInput.skillIds);
    const input = this.withInitialLocales(createUserInput);

    return this.repository.crud.createOne({
      ...input,
      disabled: false,
      password: await hash(password, 8),
    });
  }

  async createMany(
    ctx: AuthContext,
    createUserInputs: CreateUserInput[]
  ): Promise<BatchEntity> {
    const skillIds = uniq(
      createUserInputs.flatMap((item) => item.skillIds ?? [])
    );
    await this.assertSkillsExist(ctx, skillIds);

    const inputs: UserCreateRecord[] = await Promise.all(
      createUserInputs.map(async ({ password, ...createUserInput }) => {
        const input = this.withInitialLocales(createUserInput);
        return {
          ...input,
          disabled: false,
          password: await hash(password, 8),
        };
      })
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

    const isChangingLocales =
      rest.locale !== undefined || rest.locales !== undefined;
    if (isChangingLocales) {
      const current = await this.repository.crud.findOneById(id);
      assertPreferredLocaleInLocales(
        rest.locale ?? current.locale,
        rest.locales ?? current.locales
      );
    }

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

    const isChangingLocales =
      rest.locale !== undefined || rest.locales !== undefined;
    if (isChangingLocales) {
      const users = await this.repository.crud.findManyById(ids);
      for (const user of users) {
        assertPreferredLocaleInLocales(
          rest.locale ?? user.locale,
          rest.locales ?? user.locales
        );
      }
    }

    if (!password) {
      return this.repository.crud.updateManyById(ids, rest);
    }

    const update: UserUpdateRecord = {
      ...rest,
      password: await hash(password, 8),
    };

    return this.repository.crud.updateManyById(ids, update);
  }

  async toggleStatusOne(
    id: string,
    disabled: boolean
  ): Promise<UserEntityRecord> {
    const before = await this.repository.crud.findOneById(id);
    const updated = await this.repository.crud.updateOneById(id, { disabled });

    if (before.disabled && !updated.disabled) {
      await this.eventEmitter.emitAsync(
        DomainEvents.user.accountEnabled,
        new UserAccountEnabledEvent(updated.id, updated.email, updated.name)
      );
    }

    return updated;
  }

  async toggleStatusMany(
    ids: string[],
    disabled: boolean
  ): Promise<BatchEntity> {
    const beforeUsers = disabled
      ? []
      : await this.repository.crud.findManyById(ids);

    const batch = await this.repository.crud.updateManyById(ids, { disabled });

    if (!disabled) {
      await Promise.all(
        beforeUsers
          .filter((user) => user.disabled)
          .map((user) =>
            this.eventEmitter.emitAsync(
              DomainEvents.user.accountEnabled,
              new UserAccountEnabledEvent(user.id, user.email, user.name)
            )
          )
      );
    }

    return batch;
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

    await Promise.all(
      users.map((user) =>
        this.eventEmitter.emitAsync(
          DomainEvents.user.deleted,
          new UserDeletedEvent(user.id)
        )
      )
    );

    return this.repository.crud.deleteManyById(ids);
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.repository.detachSkill(skillId);
  }

  private assertDeletable(user: UserEntityRecord): void {
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(i18nKey("users.SUPER_ADMIN_NOT_DELETABLE"));
    }
  }

  private withInitialLocales<T extends { locale?: Locale; locales?: Locale[] }>(
    input: T
  ): T {
    if (input.locale === undefined) return input;

    const locales = input.locales ?? [input.locale];
    assertPreferredLocaleInLocales(input.locale, locales);

    return { ...input, locales };
  }

  private assertSkillsExist(
    ctx: AuthContext,
    skillIds?: string[]
  ): Promise<void> {
    if (skillIds === undefined) return Promise.resolve();
    return this.skillsValidator.assertSkillsEnabled(ctx, skillIds);
  }
}
