import { Field, InputType, Int } from "@nestjs/graphql";
import { IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { DateRangeInput } from "@/core/inputs/date-range.input";

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
  @Field(() => String)
  slug: string;

  @Field(() => String)
  organization: string;

  @Field(() => String)
  category: string;

  @Field(() => String)
  status: string;

  @OptionalField(() => String)
  @IsUrl()
  url?: string;

  @OptionalField(() => Int)
  hours?: number;

  @Field(() => [CreateEducationTranslationInput])
  i18n: CreateEducationTranslationInput[];

  @OptionalField(() => DateRangeInput)
  date?: DateRangeInput;

  @OptionalField(() => [String])
  skills?: string[];
}
