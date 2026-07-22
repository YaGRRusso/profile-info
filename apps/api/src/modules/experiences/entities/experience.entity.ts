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
export class ExperienceEntity extends BaseEntity {
  @Field(() => Number)
  relevance: number;

  @OptionalField(() => String)
  slug?: string;

  @Field(() => ID)
  ownerId: string;

  @Field(() => UserEntity)
  owner: UserEntity;

  @OptionalField(() => ID)
  organizationId?: string | null;

  @OptionalField(() => OrganizationEntity)
  organization?: OrganizationEntity;

  @Field(() => ExperienceCategory)
  category: ExperienceCategory;

  @Field(() => [ExperienceTranslationLocale])
  i18n: ExperienceTranslationLocale[];

  @OptionalField(() => DateRangeEntity)
  period?: DateRangeEntity;

  @OptionalField(() => [ID])
  skillIds?: string[] | null;

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];
}

export const PaginatedExperienceEntity = createPaginatedModel(ExperienceEntity);

export type ExperienceEntityRecord = Omit<
  ExperienceEntity,
  "owner" | "organization" | "skills"
>;
