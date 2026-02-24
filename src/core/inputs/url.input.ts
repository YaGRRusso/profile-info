import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UrlInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  value: string;
}
