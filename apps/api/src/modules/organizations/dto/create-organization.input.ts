import { InputType } from "@nestjs/graphql";
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
import { RequiredField } from "@/core/decorators/required-field.decorator";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { OrganizationCategory } from "../enums/category.enum";

@InputType()
export class CreateOrganizationMessagesInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;
}

const OrganizationTranslationInput = createTranslationInput(
  CreateOrganizationMessagesInput
);

@InputType()
export class CreateOrganizationInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @OptionalField(() => String)
  @IsUrl()
  website?: string;

  @OptionalField(() => String)
  @IsUrl()
  logo?: string;

  @RequiredField(() => [OrganizationTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrganizationTranslationInput)
  i18n: TranslationInput<CreateOrganizationMessagesInput>[];

  @RequiredField(() => OrganizationCategory)
  @IsEnum(OrganizationCategory)
  category: OrganizationCategory;
}
