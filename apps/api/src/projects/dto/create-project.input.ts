import { Field, InputType } from "@nestjs/graphql";
import { IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { UrlInput } from "@/core/inputs/url.input";

@InputType()
export class CreateProjectMessagesInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

const ProjectTranslationInput = createTranslationInput(
  CreateProjectMessagesInput
);

@InputType()
export class CreateProjectInput {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  slug: string;

  @OptionalField(() => [String])
  @IsUrl({}, { each: true })
  images?: string[];

  @OptionalField(() => [String])
  skills?: string[];

  @Field(() => [ProjectTranslationInput])
  i18n: TranslationInput<CreateProjectMessagesInput>[];

  @OptionalField(() => [UrlInput])
  urls?: UrlInput[];
}
