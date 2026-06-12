import { InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";

@InputType()
export class TranslateInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  raw: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @OptionalField(() => String)
  sourceLanguage?: string;
}
