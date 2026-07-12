import { InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { RequiredField } from "@/core/decorators/required-field.decorator";

@InputType()
export class RegisterUserInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @RequiredField(() => String)
  @IsEmail()
  email: string;

  @RequiredField(() => String)
  @IsString()
  @MinLength(8)
  password: string;
}
