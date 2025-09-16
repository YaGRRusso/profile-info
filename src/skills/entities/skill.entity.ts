import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Skill {
  @Field(() => ID, { description: "Unique identifier for the skill" })
  id: string;

  @Field(() => String, { description: "Name of the skill" })
  name: string;

  @Field(() => String, { description: "Category of the skill" })
  category: string;
}
