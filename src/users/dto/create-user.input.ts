import { Field, InputType } from "@nestjs/graphql";
import { IsDate, IsEmail, IsPhoneNumber, IsPostalCode, IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class CreateUserUrlInput {
  @Field(() => String)
  code: string;

  @Field(() => String)
  value: string;
}

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
  description?: string;

  @OptionalField(() => String)
  @IsPhoneNumber()
  phone?: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  password: string;

  @OptionalField(() => String)
  @IsDate()
  birthDate?: Date;

  @OptionalField(() => String)
  address?: string;

  @OptionalField(() => String)
  @IsPostalCode()
  postalCode?: string;

  @OptionalField(() => String)
  school?: string;

  @OptionalField(() => String)
  work?: string;

  @OptionalField(() => [String])
  hobbies?: string[];

  @OptionalField(() => [CreateUserUrlInput])
  urls?: CreateUserUrlInput[];
}
