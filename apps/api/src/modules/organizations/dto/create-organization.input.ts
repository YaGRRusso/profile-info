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
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { OrganizationCategory } from "../enums/category.enum";

@InputType()
export class CreateOrganizationMessagesInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;
}

const OrganizationTranslationInput = createTranslationInput(
  CreateOrganizationMessagesInput
);

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

  @Field(() => [OrganizationTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrganizationTranslationInput)
  i18n: TranslationInput<CreateOrganizationMessagesInput>[];

  @Field(() => OrganizationCategory)
  @IsEnum(OrganizationCategory)
  category: OrganizationCategory;
}
