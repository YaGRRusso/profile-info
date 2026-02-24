import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { Url } from "@/core/entities/url.entity";
import { Skill } from "@/skills/entities/skill.entity";

@ObjectType()
export class ProjectTranslation {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@ObjectType()
export class ProjectTranslationLocale {
  @Field(() => String)
  locale: string;

  @Field(() => ProjectTranslation)
  messages: ProjectTranslation;
}

@ObjectType()
export class Project extends BaseEntity {
  @Field(() => String)
  slug: string;

  @OptionalField(() => [String])
  images?: string[];

  @OptionalField(() => [Skill])
  skills?: Skill[];

  @Field(() => [ProjectTranslationLocale])
  i18n: ProjectTranslationLocale[];

  @OptionalField(() => [Url])
  urls?: Url[];
}
