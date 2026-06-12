import { InputType } from "@nestjs/graphql";
import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { RequiredField } from "@/core/decorators/required-field.decorator";

@InputType()
export class DetailInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  key: string;

  @RequiredField(() => [String])
  @IsArray()
  @IsString({ each: true })
  value: string[];
}
