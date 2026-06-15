import { InputType } from "@nestjs/graphql";
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  MinLength,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { UserRole } from "@/core/enums/user-role.enum";
import { UrlInput } from "@/core/inputs/url.input";

@InputType()
export class CreateUserInput {
  @OptionalField(() => String)
  @IsUrl()
  avatar?: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @OptionalField(() => String)
  title?: string;

  @OptionalField(() => String)
  phone?: string;

  @RequiredField(() => String)
  @IsEmail()
  email: string;

  @RequiredField(() => String)
  @IsString()
  @MinLength(8)
  password: string;

  @OptionalField(() => String)
  @IsDateString()
  birth?: Date;

  @OptionalField(() => String)
  address?: string;

  @OptionalField(() => String)
  description?: string;

  @OptionalField(() => UserRole)
  role?: UserRole;

  @OptionalField(() => [UrlInput])
  urls?: UrlInput[];
}
