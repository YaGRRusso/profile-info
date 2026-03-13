import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { DateRangeInput } from "@/core/inputs/date-range.input";

@InputType()
export class CreateExperienceMessagesInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}

@InputType()
export class CreateExperienceTranslationInput {
  @Field(() => String)
  locale: string;

  @Field(() => CreateExperienceMessagesInput)
  messages: CreateExperienceMessagesInput;
}

@InputType()
export class CreateExperienceRoleInput {
  @Field(() => [CreateExperienceTranslationInput])
  i18n: CreateExperienceTranslationInput[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skills?: string[];
}

@InputType()
export class CreateExperienceInput {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  organization: string;

  @Field(() => String)
  category: string;

  @Field(() => [CreateExperienceRoleInput])
  roles: CreateExperienceRoleInput[];
}
