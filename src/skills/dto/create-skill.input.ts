import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateSkillInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  category: string;
}
