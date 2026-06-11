import { Field, InputType, Int } from "@nestjs/graphql";
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
import { DateRangeInput } from "@/core/inputs/date-range.input";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { CourseStatus } from "../enums/status.enum";

@InputType()
export class CreateCourseMessagesInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
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

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field(() => String)
  @IsMongoId()
  organization: string;

  @Field(() => CourseStatus)
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

  @Field(() => [CourseTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationInput)
  i18n: TranslationInput<CreateCourseMessagesInput>[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skills?: string[];
}
