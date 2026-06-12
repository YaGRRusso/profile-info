import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { ResourceType } from "../enums/resource-type";
import { DetailInput } from "./detail.input";

@InputType()
export class SummarizeInput {
  @OptionalField(() => [DetailInput])
  details?: DetailInput[];

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  raw: string;

  @Field(() => ResourceType)
  @IsEnum(ResourceType)
  type: ResourceType;
}
