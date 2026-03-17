import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { DateRangeEntity } from "@/core/entities/date-range.entity";
import { Organization } from "@/organizations/entities/organization.entity";
import { Skill } from "@/skills/entities/skill.entity";
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

  @OptionalField(() => [Skill])
  skills?: Skill[];
}

@ObjectType()
export class Experience extends BaseEntity {
  @Field(() => Boolean)
  isFeatured: boolean;

  @Field(() => String)
  slug: string;

  @Field(() => Organization)
  organization: Organization;

  @Field(() => ExperienceCategory)
  category: ExperienceCategory;

  @Field(() => [ExperienceRole])
  roles: ExperienceRole[];

  @OptionalField(() => [Skill])
  skills?: Skill[];
}
