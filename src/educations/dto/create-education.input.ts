import { Field, InputType, Int } from "@nestjs/graphql";
import { IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class CreateEducationSchoolInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  @IsUrl()
  url: string;

  @Field(() => String)
  @IsUrl()
  thumbnail: string;
}

@InputType()
export class CreateEducationMessagesInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@InputType()
export class CreateEducationTranslationLocaleInput {
  @Field(() => String)
  locale: string;

  @Field(() => CreateEducationMessagesInput)
  messages: CreateEducationMessagesInput;
}

@InputType()
export class CreateDateRangeInput {
  @OptionalField(() => Date)
  from?: Date;

  @OptionalField(() => Date)
  to?: Date;
}

@InputType()
export class CreateEducationInput {
  @Field(() => String)
  slug: string;

  @Field(() => CreateEducationSchoolInput)
  school: CreateEducationSchoolInput;

  @Field(() => String)
  category: string;

  @Field(() => String)
  status: string;

  @OptionalField(() => String)
  @IsUrl()
  url?: string;

  @OptionalField(() => Int)
  hours?: number;

  @Field(() => [CreateEducationTranslationLocaleInput])
  i18n: CreateEducationTranslationLocaleInput[];

  @OptionalField(() => [String])
  skills?: string[];

  @OptionalField(() => CreateDateRangeInput)
  date?: CreateDateRangeInput;
}
