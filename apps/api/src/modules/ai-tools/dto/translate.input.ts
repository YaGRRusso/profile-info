import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class TranslateInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  raw: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @OptionalField(() => String)
  sourceLanguage?: string;
}
