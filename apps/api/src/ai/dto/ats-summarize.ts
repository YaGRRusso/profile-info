import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class AtsSummarizeInput {
  @OptionalField(() => [String])
  details?: string[];

  @Field(() => String)
  raw: string;

  @Field(() => [String])
  skills: string[];

  @Field(() => String)
  type: "experience" | "project" | "education" | "course";

  @OptionalField(() => String)
  organization?: string;
}
