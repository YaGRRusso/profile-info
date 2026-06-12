import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

@InputType()
export class DetailInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  key: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  value: string[];
}
