import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Url {
  @Field(() => String)
  title: string;

  @Field(() => String)
  value: string;
}
