import { InputType, Int } from "@nestjs/graphql";
import { Max } from "class-validator";
import { OptionalField } from "../decorators/optional-field.decorator";

@InputType()
export class PaginationInput {
  @OptionalField(() => Int)
  skip?: number;

  @OptionalField(() => Int)
  @Max(50)
  limit?: number;
}
