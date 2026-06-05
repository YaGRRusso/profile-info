import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { ResourceType } from "../enums/resource-type";
import { DetailInput } from "./detail.input";

@InputType()
export class SummarizeInput {
  @OptionalField(() => [DetailInput])
  details?: DetailInput[];

  @Field(() => String)
  raw: string;

  @Field(() => ResourceType)
  type: ResourceType;
}
