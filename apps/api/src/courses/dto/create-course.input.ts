import { Field, InputType, Int } from "@nestjs/graphql";
import { IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { DateRangeInput } from "@/core/inputs/date-range.input";
import { CourseStatus } from "../enums/status.enum";
import { CourseType } from "../enums/type.enum";

@InputType()
export class CreateCourseMessagesInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@InputType()
export class CreateCourseTranslationInput {
  @Field(() => String)
  locale: string;

  @Field(() => CreateCourseMessagesInput)
  messages: CreateCourseMessagesInput;
}

@InputType()
export class CreateCourseInput {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  organization: string;

  @Field(() => CourseType)
  type: CourseType;

  @Field(() => CourseStatus)
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
  i18n: CreateCourseTranslationInput[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skills?: string[];
}
