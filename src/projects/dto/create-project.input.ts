import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateProjectInput {
  @Field(() => Int)
  exampleField: number;
}
