import { InputType, Int } from "@nestjs/graphql";
import { Max } from "class-validator";
import { OptionalField } from "../decorators/optional-field.decorator";

@InputType()
export class PaginationInput {
  @OptionalField(() => Int, { defaultValue: 0, nullable: true })
  skip?: number;

  @OptionalField(() => Int, { defaultValue: 10, nullable: true })
  @Max(10)
  limit?: number;
}
