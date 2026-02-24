import { InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class DateRangeInput {
  @OptionalField(() => Date)
  from?: Date;

  @OptionalField(() => Date)
  to?: Date;
}
