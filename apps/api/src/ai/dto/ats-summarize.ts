import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { ResourceType } from "../enums/resource-type";

@InputType()
export class AtsSummarizeInput {
  @OptionalField(() => [String])
  details?: string[];

  @Field(() => String)
  raw: string;

  @Field(() => [String])
  skills: string[];

  @Field(() => ResourceType)
  type: ResourceType;
}
