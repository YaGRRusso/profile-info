import { Field, ID, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { DateRangeEntity } from "@/core/entities/date-range.entity";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { EducationLevel } from "../enums/level.enum";
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
export class EducationEntity extends BaseEntity {
  @Field(() => Number)
  relevance: number;

  @Field(() => String)
  slug: string;

  @Field(() => ID)
  ownerId: string;

  @Field(() => OrganizationEntity)
  organization: OrganizationEntity;

  @Field(() => EducationLevel)
  level: EducationLevel;

  @Field(() => EducationStatus)
  status: EducationStatus;

  @OptionalField(() => String)
  url?: string;

  @OptionalField(() => String)
  image?: string;

  @Field(() => [EducationTranslationLocale])
  i18n: EducationTranslationLocale[];

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];

  @OptionalField(() => DateRangeEntity)
  period?: DateRangeEntity;
}

export const PaginatedEducationEntity = createPaginatedModel(EducationEntity);
