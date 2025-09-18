import { Field, InputType } from "@nestjs/graphql";
import { IsUrl } from "class-validator";

@InputType()
export class ProjectTranslationInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;
}

@InputType()
export class ProjectTranslationLocaleInput {
  @Field(() => String)
  locale: string;

  @Field(() => ProjectTranslationInput)
  messages: ProjectTranslationInput;
}

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  @IsUrl()
  demoUrl?: string;

  @Field(() => String, { nullable: true })
  @IsUrl()
  repositoryUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsUrl({}, { each: true })
  images?: string[];

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field(() => [ProjectTranslationLocaleInput])
  i18n: ProjectTranslationLocaleInput[];
}
