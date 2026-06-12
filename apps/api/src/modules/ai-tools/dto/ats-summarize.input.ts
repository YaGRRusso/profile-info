import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { ResourceType } from "../enums/resource-type";
import { DetailInput } from "./detail.input";

@InputType()
export class AtsSummarizeInput {
  @OptionalField(() => [DetailInput])
  details?: DetailInput[];

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  raw: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @Field(() => ResourceType)
  @IsEnum(ResourceType)
  type: ResourceType;
}
