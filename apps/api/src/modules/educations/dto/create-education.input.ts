import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { DateRangeInput } from "@/core/inputs/date-range.input";
import { EducationLevel } from "../enums/level.enum";
import { EducationStatus } from "../enums/status.enum";

@InputType()
export class CreateEducationMessagesInput {
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
export class CreateEducationTranslationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  locale: string;

  @Field(() => CreateEducationMessagesInput)
  @ValidateNested()
  @Type(() => CreateEducationMessagesInput)
  messages: CreateEducationMessagesInput;
}

@InputType()
export class CreateEducationInput {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field(() => String)
  @IsMongoId()
  organization: string;

  @Field(() => EducationLevel)
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @Field(() => EducationStatus)
  @IsEnum(EducationStatus)
  status: EducationStatus;

  @OptionalField(() => String)
  @IsUrl()
  url?: string;

  @OptionalField(() => String)
  @IsUrl()
  image?: string;

  @Field(() => [CreateEducationTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationTranslationInput)
  i18n: CreateEducationTranslationInput[];

  @OptionalField(() => DateRangeInput)
  period?: DateRangeInput;

  @OptionalField(() => [String])
  skills?: string[];
}
