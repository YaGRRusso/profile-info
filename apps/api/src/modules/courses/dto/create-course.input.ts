import { InputType, Int } from "@nestjs/graphql";
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
import { CourseStatus } from "../enums/status.enum";

@InputType()
export class CreateCourseMessagesInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;
}

const CourseTranslationInput = createTranslationInput(
  CreateCourseMessagesInput
);

@InputType()
export class CreateCourseInput {
  @OptionalField(() => Number)
  relevance?: number;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @RequiredField(() => String)
  @IsMongoId()
  organizationId: string;

  @RequiredField(() => CourseStatus)
  @IsEnum(CourseStatus)
  status: CourseStatus;

  @OptionalField(() => String)
  @IsUrl()
  url?: string;

  @OptionalField(() => String)
  @IsUrl()
  image?: string;

  @OptionalField(() => Int)
  hours?: number;

  @RequiredField(() => [CourseTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationInput)
  i18n: TranslationInput<CreateCourseMessagesInput>[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skillIds?: string[];
}
