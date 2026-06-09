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

@InputType()
export class CreateExperienceTranslationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  locale: string;

  @Field(() => CreateExperienceMessagesInput)
  @ValidateNested()
  @Type(() => CreateExperienceMessagesInput)
  messages: CreateExperienceMessagesInput;
}

@InputType()
export class CreateExperienceRoleInput {
  @Field(() => [CreateExperienceTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceTranslationInput)
  i18n: CreateExperienceTranslationInput[];

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
