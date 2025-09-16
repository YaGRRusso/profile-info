import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Skill } from "@/skills/entities/skill.entity";

@ObjectType()
export class ProjectTranslation {
  @Field()
  name: string;

  @Field()
  description: string;
}

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

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

  @Field(() => ProjectTranslation)
  i18n?: ProjectTranslation;
}
