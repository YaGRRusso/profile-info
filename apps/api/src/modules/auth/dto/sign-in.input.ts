import { InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { RequiredField } from "@/core/decorators/required-field.decorator";

@InputType()
export class SignInInput {
  @RequiredField(() => String)
  @IsEmail()
  email: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  password: string;
}
