import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class DetailInput {
  @Field(() => String)
  key: string;

  @Field(() => [String])
  value: string[];
}
