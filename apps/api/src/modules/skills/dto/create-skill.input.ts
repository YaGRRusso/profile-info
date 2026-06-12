import { InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { SkillCategory } from "../enums/category.enum";

@InputType()
export class CreateSkillInput {
  @OptionalField(() => Number)
  relevance?: number;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @RequiredField(() => SkillCategory)
  @IsEnum(SkillCategory)
  category: SkillCategory;
}
