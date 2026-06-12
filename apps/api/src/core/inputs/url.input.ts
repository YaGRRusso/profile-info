import { InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";
import { RequiredField } from "@/core/decorators/required-field.decorator";

@InputType()
export class UrlInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @RequiredField(() => String)
  @IsUrl()
  value: string;
}
