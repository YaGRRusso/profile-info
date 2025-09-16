import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class CreateSkillInput {
  @Field(() => String, { description: "Name of the skill" })
  @IsNotEmpty()
  name: string;

  @Field(() => String, { description: "Category of the skill" })
  @IsNotEmpty()
  category: string;
}
