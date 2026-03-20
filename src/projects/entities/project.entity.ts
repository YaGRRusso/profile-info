import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import {
  createTranslationEntity,
  TranslationEntity,
} from "@/core/entities/translation.entity";
import { UrlEntity } from "@/core/entities/url.entity";
import { SkillEntity } from "@/skills/entities/skill.entity";

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
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  slug: string;

  @OptionalField(() => [String])
  images?: string[];

  @OptionalField(() => [SkillEntity])
  skills?: SkillEntity[];

  @Field(() => [ProjectTranslationEntity])
  i18n: TranslationEntity<ProjectMessages>[];

  @OptionalField(() => [UrlEntity])
  urls?: UrlEntity[];
}
