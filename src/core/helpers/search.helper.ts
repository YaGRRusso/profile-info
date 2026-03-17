import { isNil, pickBy } from "lodash";

export function clearFilters<T extends object>(filters?: T) {
  return pickBy(filters, (v) => !isNil(v));
}

export function clearSort<T extends object>(sort?: T) {
  return { updatedAt: -1, ...pickBy(sort, (v) => !isNil(v)) };
}
