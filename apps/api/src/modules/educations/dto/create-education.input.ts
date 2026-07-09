import { InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { DateRangeInput } from "@/core/inputs/date-range.input";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { EducationLevel } from "../enums/level.enum";
import { EducationStatus } from "../enums/status.enum";

@InputType()
export class CreateEducationMessagesInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;
}

const EducationTranslationInput = createTranslationInput(
  CreateEducationMessagesInput
);

@InputType()
export class CreateEducationInput {
  @OptionalField(() => Number)
  relevance?: number;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @RequiredField(() => String)
  @IsMongoId()
  organizationId: string;

  @RequiredField(() => EducationLevel)
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @RequiredField(() => EducationStatus)
  @IsEnum(EducationStatus)
  status: EducationStatus;

  @OptionalField(() => String)
  @IsUrl()
  url?: string;

  @OptionalField(() => String)
  @IsUrl()
  image?: string;

  @RequiredField(() => [EducationTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationTranslationInput)
  i18n: TranslationInput<CreateEducationMessagesInput>[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  @IsMongoId({ each: true })
  skillIds?: string[];
}
