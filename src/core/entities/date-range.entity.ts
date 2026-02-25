import { ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@ObjectType()
export class DateRangeEntity {
  @OptionalField(() => Date)
  from?: Date;

  @OptionalField(() => Date)
  to?: Date;
}
