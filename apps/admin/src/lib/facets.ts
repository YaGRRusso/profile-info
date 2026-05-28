/** biome-ignore-all lint/suspicious/noExplicitAny: generic function */
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
  map: Map<any, number>,
  labels?: Array<{ value: T; label: string }>
): UniqueFacets<T>[] {
  const mapper = new Map(labels?.map(({ value, label }) => [value, label]));
  return [...map].map(([value, count]) => ({
    value: value as T,
    label: mapper.get(value as T) ?? String(value),
    count,
  }));
}

export function getMinMaxFacets<T = number>(
  result: readonly [any, any] | undefined
): MinMaxFacets<T> {
  return {
    min: result?.[0] as T | undefined,
    max: result?.[1] as T | undefined,
  };
}
