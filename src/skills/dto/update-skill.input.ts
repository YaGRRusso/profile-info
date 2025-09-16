import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { CreateSkillInput } from "./create-skill.input";

@InputType()
export class UpdateSkillInput extends PartialType(CreateSkillInput) {
  @Field(() => ID)
  id: string;
}
