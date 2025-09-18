import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { Skill } from "@/skills/entities/skill.entity";

@ObjectType()
export class ProjectTranslation {
  @Field()
  name: string;

  @Field()
  description: string;
}

@ObjectType()
export class ProjectTranslationLocale {
  @Field()
  locale: string;

  @Field(() => ProjectTranslation)
  messages: ProjectTranslation;
}

@ObjectType()
export class Project extends BaseEntity {
  @Field(() => String)
  slug: string;

  @OptionalField(() => String)
  demoUrl?: string;

  @OptionalField(() => String)
  repositoryUrl?: string;

  @OptionalField(() => [String])
  images?: string[];

  @OptionalField(() => [Skill])
  skills?: Skill[];

  @Field(() => [ProjectTranslationLocale])
  i18n: ProjectTranslationLocale[];
}
