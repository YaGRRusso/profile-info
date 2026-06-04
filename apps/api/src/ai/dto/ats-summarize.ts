import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { ResourceType } from "../enums/resource-type";

@InputType()
export class DetailInput {
  @Field(() => String)
  key: string;

  @Field(() => [String])
  value: string[];
}

@InputType()
export class AtsSummarizeInput {
  @OptionalField(() => [DetailInput])
  details?: DetailInput[];

  @Field(() => String)
  raw: string;

  @Field(() => [String])
  skills: string[];

  @Field(() => ResourceType)
  type: ResourceType;
}

@InputType()
export class TranslateInput {
  @Field(() => String)
  raw: string;

  @Field(() => String)
  targetLanguage: string;

  @OptionalField(() => String)
  sourceLanguage?: string;
}
