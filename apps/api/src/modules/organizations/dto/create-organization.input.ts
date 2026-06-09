import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { OrganizationCategory } from "../enums/category.enum";

@InputType()
export class CreateOrganizationMessagesInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;
}

@InputType()
export class CreateOrganizationTranslationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  locale: string;

  @Field(() => CreateOrganizationMessagesInput)
  @ValidateNested()
  @Type(() => CreateOrganizationMessagesInput)
  messages: CreateOrganizationMessagesInput;
}

@InputType()
export class CreateOrganizationInput {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsUrl()
  website: string;

  @Field(() => String)
  @IsUrl()
  logo: string;

  @Field(() => [CreateOrganizationTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrganizationTranslationInput)
  i18n: CreateOrganizationTranslationInput[];

  @Field(() => OrganizationCategory)
  @IsEnum(OrganizationCategory)
  category: OrganizationCategory;
}
