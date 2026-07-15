/** biome-ignore-all lint/suspicious/noExplicitAny: generic function */
import { EMPTY_MARKER, isEmptyValue } from "@/lib/empty-value";
export interface UniqueFacets<T> {
  count: number;
  label: string;
  value: T;
}

export interface MinMaxFacets<T> {
  max: T | undefined;
  min: T | undefined;
}

export function getUniqueFacets<T = string>(
  map: Map<any, number> | undefined,
  labels?: Array<{ value: T; label: string }>
): UniqueFacets<T>[] {
  if (!map) return [];

  const mapper = new Map(labels?.map(({ value, label }) => [value, label]));
  return [...map].map(([value, count]) => ({
    count,
    label:
      mapper.get(value as T) ??
      (isEmptyValue(value) ? EMPTY_MARKER : String(value)),
    value: value as T,
  }));
}

export function getMinMaxFacets<T = number>(
  result: readonly [any, any] | undefined
): MinMaxFacets<T> {
  return {
    max: result?.[1] as T | undefined,
    min: result?.[0] as T | undefined,
  };
}
