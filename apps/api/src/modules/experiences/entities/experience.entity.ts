import { Field, ID, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { DateRangeEntity } from "@/core/entities/date-range.entity";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { ExperienceCategory } from "../enums/category.enum";

@ObjectType()
export class ExperienceMessages {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@ObjectType()
export class ExperienceTranslationLocale {
  @Field(() => String)
  locale: string;

  @Field(() => ExperienceMessages)
  messages: ExperienceMessages;
}

@ObjectType()
export class ExperienceRole {
  @Field(() => [ExperienceTranslationLocale])
  i18n: ExperienceTranslationLocale[];

  @OptionalField(() => DateRangeEntity)
  period?: DateRangeEntity;

  @OptionalField(() => [ID])
  skillIds?: string[];

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];
}

@ObjectType()
export class ExperienceEntity extends BaseEntity {
  @Field(() => Number)
  relevance: number;

  @Field(() => String)
  slug: string;

  @Field(() => ID)
  ownerId: string;

  @Field(() => UserEntity)
  owner: UserEntity;

  @Field(() => ID)
  organizationId: string;

  @Field(() => OrganizationEntity)
  organization: OrganizationEntity;

  @Field(() => ExperienceCategory)
  category: ExperienceCategory;

  @Field(() => [ExperienceRole])
  roles: ExperienceRole[];

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];
}

export const PaginatedExperienceEntity = createPaginatedModel(ExperienceEntity);

export type ExperienceRoleRecord = Omit<ExperienceRole, "skills">;

export type ExperienceEntityRecord = Omit<
  ExperienceEntity,
  "owner" | "organization" | "skills" | "roles"
> & {
  roles: ExperienceRoleRecord[];
};
