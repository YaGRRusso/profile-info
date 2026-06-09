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

@InputType()
export class CreateCourseTranslationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  locale: string;

  @Field(() => CreateCourseMessagesInput)
  @ValidateNested()
  @Type(() => CreateCourseMessagesInput)
  messages: CreateCourseMessagesInput;
}

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

  @Field(() => [CreateCourseTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseTranslationInput)
  i18n: CreateCourseTranslationInput[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skills?: string[];
}
