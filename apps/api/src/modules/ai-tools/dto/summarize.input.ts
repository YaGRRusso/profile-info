import { InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { ResourceType } from "../enums/resource-type";
import { DetailInput } from "./detail.input";

@InputType()
export class SummarizeInput {
  @OptionalField(() => [DetailInput])
  details?: DetailInput[];

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  raw: string;

  @RequiredField(() => ResourceType)
  @IsEnum(ResourceType)
  type: ResourceType;
}
