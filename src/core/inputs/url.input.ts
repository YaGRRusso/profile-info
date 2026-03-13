import { Field, InputType } from "@nestjs/graphql";
import { IsUrl } from "class-validator";

@InputType()
export class UrlInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  @IsUrl()
  value: string;
}
