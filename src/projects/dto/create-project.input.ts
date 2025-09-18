import { Field, InputType } from "@nestjs/graphql";
import { IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class CreateProjectTranslationInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;
}

@InputType()
export class CreateProjectTranslationLocaleInput {
  @Field(() => String)
  locale: string;

  @Field(() => CreateProjectTranslationInput)
  messages: CreateProjectTranslationInput;
}

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  slug: string;

  @OptionalField(() => String)
  @IsUrl()
  demoUrl?: string;

  @OptionalField(() => String)
  @IsUrl()
  repositoryUrl?: string;

  @OptionalField(() => [String])
  @IsUrl({}, { each: true })
  images?: string[];

  @OptionalField(() => [String])
  skills?: string[];

  @Field(() => [CreateProjectTranslationLocaleInput])
  i18n: CreateProjectTranslationLocaleInput[];
}
