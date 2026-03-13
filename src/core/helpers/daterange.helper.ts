import { DateRangeModel } from "../schemas/daterange.schema";

export function sortDateRange<T extends { period?: DateRangeModel }>(
  data: T[]
) {
  return data.sort((a, b) => {
    const dateA = new Date(a.period?.from ?? 0).getTime();
    const dateB = new Date(b.period?.from ?? 0).getTime();
    return dateB - dateA;
  });
}
