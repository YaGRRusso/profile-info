import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class TranslateInput {
  @Field(() => String)
  raw: string;

  @Field(() => String)
  targetLanguage: string;

  @OptionalField(() => String)
  sourceLanguage?: string;
}
