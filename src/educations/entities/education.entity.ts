import { Field, Int, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { DateRangeEntity } from "@/core/entities/date-range.entity";
import { Organization } from "@/organizations/entities/organization.entity";
import { Skill } from "@/skills/entities/skill.entity";
import { EducationCategory } from "../enums/category.enum";
import { EducationStatus } from "../enums/status.enum";

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
  @Field(() => Boolean)
  isFeatured: boolean;

  @Field(() => String)
  slug: string;

  @Field(() => Organization)
  organization: Organization;

  @Field(() => EducationCategory)
  category: EducationCategory;

  @Field(() => EducationStatus)
  status: EducationStatus;

  @OptionalField(() => String)
  url?: string;

  @OptionalField(() => String)
  image?: string;

  @OptionalField(() => Int)
  hours?: number;

  @Field(() => [EducationTranslationLocale])
  i18n: EducationTranslationLocale[];

  @OptionalField(() => [Skill])
  skills?: Skill[];

  @OptionalField(() => DateRangeEntity)
  period?: DateRangeEntity;
}
