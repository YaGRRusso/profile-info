import { InputType } from "@nestjs/graphql";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { Locale } from "@/core/enums/locale.enum";

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

  @RequiredField(() => Locale)
  @IsEnum(Locale)
  locale: Locale;

  @OptionalField(() => [Locale])
  @IsArray()
  @IsEnum(Locale, { each: true })
  locales?: Locale[];
}
