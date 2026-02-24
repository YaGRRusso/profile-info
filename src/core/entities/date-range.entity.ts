import { ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@ObjectType()
export class DateRange {
  @OptionalField(() => Date)
  from?: Date;

  @OptionalField(() => Date)
  to?: Date;
}
