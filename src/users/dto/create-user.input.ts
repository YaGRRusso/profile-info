import { Field, InputType } from "@nestjs/graphql";
import { IsDateString, IsEmail, IsUrl } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class CreateUserUrlInput {
  @Field(() => String)
  title: string;

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

  @OptionalField(() => [CreateUserUrlInput])
  urls?: CreateUserUrlInput[];
}
