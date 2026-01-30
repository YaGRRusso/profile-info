import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { Skill } from "@/skills/entities/skill.entity";

@ObjectType()
export class ProjectTranslation {
  @Field()
  title: string;

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
export class ProjectUrl {
  @Field(() => String)
  title: string;

  @Field(() => String)
  value: string;
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

  @OptionalField(() => [ProjectUrl])
  urls?: ProjectUrl[];
}
