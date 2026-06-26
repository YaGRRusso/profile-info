import type { QueryFilter } from "mongoose";
import { toObjectId, toObjectIds } from "@/core/mappers/base.mapper";

interface ObjectIdFilterRefs<TFilter> {
  array?: readonly (keyof TFilter & string)[];
  single?: readonly (keyof TFilter & string)[];
}

export function withObjectIdRefs<TFilter extends object, TModel>(
  entity: TFilter,
  refs: ObjectIdFilterRefs<TFilter>
): QueryFilter<TModel> {
  const result = { ...entity } as Record<string, unknown>;

  for (const key of refs.single ?? []) {
    const value = entity[key as keyof TFilter];
    if (typeof value === "string") {
      result[key] = toObjectId(value);
    }
  }

  for (const key of refs.array ?? []) {
    const value = entity[key as keyof TFilter];
    if (Array.isArray(value)) {
      result[key] = toObjectIds(value as string[]);
    }
  }

  return result as QueryFilter<TModel>;
}
