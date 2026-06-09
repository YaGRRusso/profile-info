import { Field, InputType } from "@nestjs/graphql";
import { IsDateString, IsEmail, IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { UserRole } from "@/core/enums/user-role.enum";
import { UrlInput } from "@/core/inputs/url.input";

@InputType()
export class CreateUserInput {
  @OptionalField(() => String)
  @IsUrl()
  avatar?: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  nickname: string;

  @OptionalField(() => String)
  title?: string;

  @OptionalField(() => String)
  phone?: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  password: string;

  @OptionalField(() => String)
  @IsDateString()
  birth?: Date;

  @OptionalField(() => String)
  address?: string;

  @OptionalField(() => UserRole)
  role?: UserRole;

  @OptionalField(() => [UrlInput])
  urls?: UrlInput[];
}
