import { Field, ID, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import {
  createTranslationEntity,
  TranslationEntity,
} from "@/core/entities/translation.entity";
import { UrlEntity } from "@/core/entities/url.entity";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";

@ObjectType()
export class ProjectMessages {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

const ProjectTranslationEntity = createTranslationEntity(ProjectMessages);

@ObjectType()
export class ProjectEntity extends BaseEntity {
  @Field(() => Number)
  relevance: number;

  @Field(() => String)
  slug: string;

  @Field(() => ID)
  ownerId: string;

  @Field(() => UserEntity)
  owner: UserEntity;

  @OptionalField(() => [String])
  images?: string[];

  @OptionalField(() => [ID])
  skillIds?: string[];

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];

  @Field(() => [ProjectTranslationEntity])
  i18n: TranslationEntity<ProjectMessages>[];

  @OptionalField(() => [UrlEntity])
  urls?: UrlEntity[];
}

export const PaginatedProjectEntity = createPaginatedModel(ProjectEntity);

export type ProjectEntityRecord = Omit<ProjectEntity, "owner" | "skills">;
