import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class CreateSkillInput {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  category: string;

  @OptionalField(() => String)
  color?: string;
}
