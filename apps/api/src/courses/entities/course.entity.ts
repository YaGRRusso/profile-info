import { Field, Int, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { OrganizationEntity } from "@/organizations/entities/organization.entity";
import { SkillEntity } from "@/skills/entities/skill.entity";
import { CourseStatus } from "../enums/status.enum";

@ObjectType()
export class CourseMessages {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@ObjectType()
export class CourseTranslationLocale {
  @Field(() => String)
  locale: string;

  @Field(() => CourseMessages)
  messages: CourseMessages;
}

@ObjectType()
export class CourseEntity extends BaseEntity {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  slug: string;

  @Field(() => OrganizationEntity)
  organization: OrganizationEntity;

  @Field(() => CourseStatus)
  status: CourseStatus;

  @OptionalField(() => String)
  url?: string;

  @OptionalField(() => String)
  image?: string;

  @OptionalField(() => Int)
  hours?: number;

  @Field(() => [CourseTranslationLocale])
  i18n: CourseTranslationLocale[];

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];
}
