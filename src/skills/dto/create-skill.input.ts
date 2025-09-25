import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class CreateSkillInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  category: string;

  @OptionalField(() => String)
  slug?: string;
}
