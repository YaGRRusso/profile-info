import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
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

  @OptionalField(() => [ID])
  skillIds?: string[];

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];
}

export const PaginatedCourseEntity = createPaginatedModel(CourseEntity);

export type CourseEntityRecord = Omit<
  CourseEntity,
  "owner" | "organization" | "skills"
>;
