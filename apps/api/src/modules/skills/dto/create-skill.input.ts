import { InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";

@InputType()
export class CreateSkillMessagesInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;
}

const SkillTranslationInput = createTranslationInput(CreateSkillMessagesInput);

@InputType()
export class CreateSkillInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @RequiredField(() => [SkillTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillTranslationInput)
  i18n: TranslationInput<CreateSkillMessagesInput>[];

  @OptionalField(() => String)
  @IsString()
  category?: string;

  @OptionalField(() => CatalogPartition)
  @IsEnum(CatalogPartition)
  partition?: CatalogPartition;
}
