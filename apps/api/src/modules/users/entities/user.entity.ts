import { Field, ID, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { UrlEntity } from "@/core/entities/url.entity";
import { Locale } from "@/core/enums/locale.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserOwnedCounts } from "./user-owned-counts.entity";

@ObjectType()
export class UserMessages {
  @OptionalField(() => String)
  title?: string;

  @OptionalField(() => String)
  description?: string;
}

@ObjectType()
export class UserTranslationLocale {
  @Field(() => String)
  locale: string;

  @Field(() => UserMessages)
  messages: UserMessages;
}

@ObjectType()
export class UserEntity extends BaseEntity {
  @OptionalField(() => String)
  avatar?: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  nickname: string;

  @OptionalField(() => String)
  phone?: string;

  @Field(() => String)
  email: string;

  // @Field(() => String)
  // password: string;

  @OptionalField(() => String)
  birth?: Date;

  @OptionalField(() => String)
  address?: string;

  @OptionalField(() => Locale)
  locale?: Locale;

  @OptionalField(() => [Locale])
  locales?: Locale[];

  @OptionalField(() => [UserTranslationLocale])
  i18n?: UserTranslationLocale[];

  @Field(() => UserRole, { defaultValue: UserRole.USER })
  role?: UserRole;

  @Field(() => Boolean)
  disabled: boolean;

  @OptionalField(() => [UrlEntity])
  urls?: UrlEntity[];

  @OptionalField(() => [ID])
  skillIds?: string[] | null;

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];

  @Field(() => UserOwnedCounts)
  ownedCounts?: UserOwnedCounts;
}

export const PaginatedUserEntity = createPaginatedModel(UserEntity);

export type UserEntityRecord = Omit<UserEntity, "skills" | "ownedCounts">;
