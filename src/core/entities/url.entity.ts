import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UrlEntity {
  @Field(() => String)
  title: string;

  @Field(() => String)
  value: string;
}
