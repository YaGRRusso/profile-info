import { orderBy } from "lodash";
import { DateRangeModel } from "../schemas/daterange.schema";

export function sortDateRange<T extends { period?: DateRangeModel }>(
  data: T[]
) {
  return orderBy(
    data,
    [(item) => new Date(item.period?.from ?? 0).getTime()],
    ["desc"]
  );
}
