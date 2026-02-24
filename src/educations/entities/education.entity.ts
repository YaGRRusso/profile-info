import { Field, Int, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { DateRange } from "@/core/entities/date-range.entity";
import { Skill } from "@/skills/entities/skill.entity";

@ObjectType()
export class EducationSchool {
  @Field(() => String)
  title: string;

  @Field(() => String)
  url: string;

  @Field(() => String)
  thumbnail: string;
}

@ObjectType()
export class EducationMessages {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@ObjectType()
export class EducationTranslationLocale {
  @Field(() => String)
  locale: string;

  @Field(() => EducationMessages)
  messages: EducationMessages;
}

@ObjectType()
export class Education extends BaseEntity {
  @Field(() => String)
  slug: string;

  @Field(() => EducationSchool)
  school: EducationSchool;

  @Field(() => String)
  category: string;

  @Field(() => String)
  status: string;

  @OptionalField(() => String)
  url?: string;

  @OptionalField(() => Int)
  hours?: number;

  @Field(() => [EducationTranslationLocale])
  i18n: EducationTranslationLocale[];

  @OptionalField(() => [Skill])
  skills?: Skill[];

  @OptionalField(() => DateRange)
  date?: DateRange;
}
