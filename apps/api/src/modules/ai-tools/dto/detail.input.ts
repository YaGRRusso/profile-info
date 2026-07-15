import { InputType } from "@nestjs/graphql";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { ContextMode } from "../enums/context-mode";

@InputType()
export class DetailInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  key: string;

  @RequiredField(() => [String])
  @IsArray()
  @IsString({ each: true })
  value: string[];

  /** When set, enriches this detail via the chosen context strategy. */
  @OptionalField(() => ContextMode)
  @IsEnum(ContextMode)
  contextMode?: ContextMode;
}
