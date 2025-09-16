import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Skill {
  @Field(() => Int, { description: "Example field (placeholder)" })
  exampleField: number;
}
