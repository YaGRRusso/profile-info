import { orderBy } from "lodash";

export function sortDateRange<
  T extends { period?: { from?: Date; to?: Date } },
>(data: T[]) {
  return orderBy(
    data,
    [(item) => new Date(item.period?.from ?? 0).getTime()],
    ["desc"]
  );
}
