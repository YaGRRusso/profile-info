import { InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { UrlInput } from "@/core/inputs/url.input";

@InputType()
export class CreateProjectMessagesInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;
}

const ProjectTranslationInput = createTranslationInput(
  CreateProjectMessagesInput
);

@InputType()
export class CreateProjectInput {
  @OptionalField(() => Number)
  relevance?: number;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @OptionalField(() => [String])
  @IsUrl({}, { each: true })
  images?: string[];

  @OptionalField(() => [String])
  skills?: string[];

  @RequiredField(() => [ProjectTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectTranslationInput)
  i18n: TranslationInput<CreateProjectMessagesInput>[];

  @OptionalField(() => [UrlInput])
  urls?: UrlInput[];
}
