import { InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { DateRangeInput } from "@/core/inputs/date-range.input";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { ExperienceCategory } from "../enums/category.enum";

@InputType()
export class CreateExperienceMessagesInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;
}

const ExperienceTranslationInput = createTranslationInput(
  CreateExperienceMessagesInput
);

@InputType()
export class CreateExperienceRoleInput {
  @RequiredField(() => [ExperienceTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceTranslationInput)
  i18n: TranslationInput<CreateExperienceMessagesInput>[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skillIds?: string[];
}

@InputType()
export class CreateExperienceInput {
  @OptionalField(() => Number)
  relevance?: number;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @RequiredField(() => String)
  @IsMongoId()
  organizationId: string;

  @RequiredField(() => ExperienceCategory)
  @IsEnum(ExperienceCategory)
  category: ExperienceCategory;

  @RequiredField(() => [CreateExperienceRoleInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceRoleInput)
  roles: CreateExperienceRoleInput[];
}
