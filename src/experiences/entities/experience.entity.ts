import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { DateRange } from "@/core/entities/date-range.entity";
import { Skill } from "@/skills/entities/skill.entity";

@ObjectType()
export class ExperienceCompany {
  @Field(() => String)
  title: string;

  @Field(() => String)
  url: string;

  @Field(() => String)
  thumbnail: string;
}

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

  @OptionalField(() => DateRange)
  date?: DateRange;

  @OptionalField(() => [Skill])
  skills?: Skill[];
}

@ObjectType()
export class Experience extends BaseEntity {
  @Field(() => String)
  slug: string;

  @Field(() => ExperienceCompany)
  company: ExperienceCompany;

  @Field(() => String)
  category: string;

  @Field(() => [ExperienceRole])
  roles: ExperienceRole[];
}
