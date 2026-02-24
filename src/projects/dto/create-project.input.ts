import { Field, InputType } from "@nestjs/graphql";
import { IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { UrlInput } from "@/core/inputs/url.input";

@InputType()
export class CreateProjectMessagesInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@InputType()
export class CreateProjectTranslationInput {
  @Field(() => String)
  locale: string;

  @Field(() => CreateProjectMessagesInput)
  messages: CreateProjectMessagesInput;
}

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  slug: string;

  @OptionalField(() => [String])
  @IsUrl({}, { each: true })
  images?: string[];

  @OptionalField(() => [String])
  skills?: string[];

  @Field(() => [CreateProjectTranslationInput])
  i18n: CreateProjectTranslationInput[];

  @OptionalField(() => [UrlInput])
  urls?: UrlInput[];
}
