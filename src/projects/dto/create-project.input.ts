import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class ProjectTranslationInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  description: string;
}

@InputType()
export class ProjectTranslationLocaleInput {
  @Field()
  @IsNotEmpty()
  locale: string;

  @Field(() => ProjectTranslationInput)
  @IsNotEmpty()
  messages: ProjectTranslationInput;
}

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  @IsNotEmpty()
  slug: string;

  @Field(() => String)
  demoUrl: string;

  @Field(() => String)
  repositoryUrl: string;

  @Field(() => [String])
  images: string[];

  @Field(() => [String])
  skills: string[];

  @Field(() => [ProjectTranslationLocaleInput])
  @IsNotEmpty()
  i18n?: ProjectTranslationLocaleInput[];
}
