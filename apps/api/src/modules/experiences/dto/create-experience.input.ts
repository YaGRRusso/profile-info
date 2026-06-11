import { Field, InputType } from "@nestjs/graphql";
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
import { DateRangeInput } from "@/core/inputs/date-range.input";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { ExperienceCategory } from "../enums/category.enum";

@InputType()
export class CreateExperienceMessagesInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;
}

const ExperienceTranslationInput = createTranslationInput(
  CreateExperienceMessagesInput
);

@InputType()
export class CreateExperienceRoleInput {
  @Field(() => [ExperienceTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceTranslationInput)
  i18n: TranslationInput<CreateExperienceMessagesInput>[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skills?: string[];
}

@InputType()
export class CreateExperienceInput {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field(() => String)
  @IsMongoId()
  organization: string;

  @Field(() => ExperienceCategory)
  @IsEnum(ExperienceCategory)
  category: ExperienceCategory;

  @Field(() => [CreateExperienceRoleInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceRoleInput)
  roles: CreateExperienceRoleInput[];
}
