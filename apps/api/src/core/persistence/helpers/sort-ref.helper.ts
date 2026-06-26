import type { SortOrder } from "mongoose";

export function toPersistenceSort<TSort extends object, TModel>(
  entity: Partial<TSort>
): Record<keyof TModel, SortOrder> {
  return { ...entity } as unknown as Record<keyof TModel, SortOrder>;
}
