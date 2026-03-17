import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { SkillCategory } from "../enums/category.enum";

@InputType()
export class CreateSkillInput {
  @OptionalField(() => Boolean)
  isFeatured?: boolean;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;
}
