import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

@InputType()
export class UrlInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsUrl()
  value: string;
}
