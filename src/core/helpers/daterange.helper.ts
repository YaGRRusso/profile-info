import { DateRangeModel } from "../schemas/daterange.schema";

export function sortDateRange<T extends { date?: DateRangeModel }>(data: T[]) {
  return data.sort((a, b) => {
    const dateA = new Date(a.date?.from ?? 0).getTime();
    const dateB = new Date(b.date?.from ?? 0).getTime();
    return dateB - dateA;
  });
}
