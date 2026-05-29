import { useMemo } from "react";
import { useStableValue } from "@/lib/use-stable-value";

export interface ActiveBadge {
  clear: () => void;
  id: string;
  value: string;
}

export interface FilterEntry {
  clear: () => void;
  id: string;
  value: unknown;
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function nonEmptyFieldEntries(
  objectValue: Record<string, unknown>
): [string, unknown][] {
  return Object.entries(objectValue).filter(
    ([, fieldValue]) => !isEmpty(fieldValue)
  );
}

function badgesForObject(
  id: string,
  objectValue: Record<string, unknown>,
  clear: () => void
): ActiveBadge[] {
  return nonEmptyFieldEntries(objectValue).map(([fieldKey, fieldValue]) => ({
    id,
    value: `${fieldKey} ${fieldValue}`,
    clear,
  }));
}

function badgesForArray(
  id: string,
  items: unknown[],
  clear: () => void
): ActiveBadge[] {
  return items.flatMap((item) => {
    if (isPlainObject(item)) return badgesForObject(id, item, clear);
    if (isEmpty(item)) return [];
    return [{ id, value: String(item), clear }];
  });
}

function badgesForFilter(filter: FilterEntry): ActiveBadge[] {
  const { id, value, clear } = filter;
  if (isEmpty(value)) return [];
  if (Array.isArray(value)) return badgesForArray(id, value, clear);
  if (isPlainObject(value)) return badgesForObject(id, value, clear);
  return [{ id, value: String(value), clear }];
}

/**
 *   - primitive          -> 1 badge with the value
 *   - object             -> 1 badge per non-empty field ("field value")
 *   - array of primitive -> 1 badge per item
 *   - array of object    -> 1 badge per non-empty field of each item
 */
export function useActiveBadges(filters: FilterEntry[]): ActiveBadge[] {
  const stableFilters = useStableValue(filters);
  return useMemo(() => stableFilters.flatMap(badgesForFilter), [stableFilters]);
}
