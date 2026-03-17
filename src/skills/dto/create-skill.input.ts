import { Field, InputType } from "@nestjs/graphql";
import { SkillCategory } from "../enums/category.enum";

@InputType()
export class CreateSkillInput {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;
}
