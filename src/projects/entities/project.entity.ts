import { Field, ObjectType } from "@nestjs/graphql";
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
  @Field()
  slug: string;

  @Field({ nullable: true })
  demoUrl?: string;

  @Field({ nullable: true })
  repositoryUrl?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => [Skill], { nullable: true })
  skills?: Skill[];

  @Field(() => [ProjectTranslationLocale])
  i18n?: ProjectTranslationLocale[];
}
