import type { DateRangeEntity } from "@/core/entities/date-range.entity";
import type { DateRangeModel } from "@/core/schemas/daterange.schema";

export function toDateRangeEntity(model: DateRangeModel): DateRangeEntity {
  return {
    from: model.from,
    to: model.to,
  };
}
