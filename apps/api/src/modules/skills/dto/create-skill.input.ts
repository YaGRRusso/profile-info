import { InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";

@InputType()
export class CreateSkillInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @OptionalField(() => String)
  @IsOptional()
  @IsString()
  category?: string;
}
