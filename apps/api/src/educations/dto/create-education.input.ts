import { Field, InputType, Int } from "@nestjs/graphql";
import { IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { DateRangeInput } from "@/core/inputs/date-range.input";
import { EducationCategory } from "../enums/category.enum";
import { EducationStatus } from "../enums/status.enum";

@InputType()
export class CreateEducationMessagesInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@InputType()
export class CreateEducationTranslationInput {
  @Field(() => String)
  locale: string;

  @Field(() => CreateEducationMessagesInput)
  messages: CreateEducationMessagesInput;
}

@InputType()
export class CreateEducationInput {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  organization: string;

  @Field(() => EducationCategory)
  category: EducationCategory;

  @Field(() => EducationStatus)
  status: EducationStatus;

  @OptionalField(() => String)
  @IsUrl()
  url?: string;

  @OptionalField(() => String)
  @IsUrl()
  image?: string;

  @OptionalField(() => Int)
  hours?: number;

  @Field(() => [CreateEducationTranslationInput])
  i18n: CreateEducationTranslationInput[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skills?: string[];
}
