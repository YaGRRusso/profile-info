import { useMemo } from "react";
import { useStableValue } from "@/lib/use-stable-value";

export interface ActiveBadge {
  clear: () => void;
  id: string;
  value: string;
}

export interface FilterEntry<Value = unknown> {
  id: string;
  /**
   * Method syntax (bivariant parameter) so callers can pass heterogeneous
   * setters (Dispatch<string|null>, Dispatch<{min,max}|null>, ...) into the
   * same FilterEntry<unknown>[] array without casts.
   */
  set(next: Value | null): void;
  value: Value;
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

function removeField(
  objectValue: Record<string, unknown>,
  fieldKey: string
): Record<string, unknown> | null {
  const next = { ...objectValue, [fieldKey]: undefined };
  return nonEmptyFieldEntries(next).length ? next : null;
}

function replaceAt<Item>(items: Item[], index: number, next: Item): Item[] {
  return items.map((current, currentIndex) =>
    currentIndex === index ? next : current
  );
}

function removeAt<Item>(items: Item[], index: number): Item[] {
  return items.filter((_, currentIndex) => currentIndex !== index);
}

function badgesForObject(
  id: string,
  objectValue: Record<string, unknown>,
  set: (next: unknown) => void
): ActiveBadge[] {
  return nonEmptyFieldEntries(objectValue).map(([fieldKey, fieldValue]) => ({
    id,
    value: `${fieldKey} ${fieldValue}`,
    clear: () => set(removeField(objectValue, fieldKey)),
  }));
}

function badgesForArrayItem(
  id: string,
  items: unknown[],
  itemIndex: number,
  set: (next: unknown) => void
): ActiveBadge[] {
  const item = items[itemIndex];
  if (isPlainObject(item)) {
    return nonEmptyFieldEntries(item).map(([fieldKey, fieldValue]) => ({
      id,
      value: `${fieldKey} ${fieldValue}`,
      clear: () => {
        const nextItem = removeField(item, fieldKey);
        const nextItems = nextItem
          ? replaceAt(items, itemIndex, nextItem)
          : removeAt(items, itemIndex);
        set(nextItems.length ? nextItems : null);
      },
    }));
  }
  if (isEmpty(item)) return [];
  return [
    {
      id,
      value: String(item),
      clear: () => {
        const nextItems = removeAt(items, itemIndex);
        set(nextItems.length ? nextItems : null);
      },
    },
  ];
}

function badgesForArray(
  id: string,
  items: unknown[],
  set: (next: unknown) => void
): ActiveBadge[] {
  return items.flatMap((_, itemIndex) =>
    badgesForArrayItem(id, items, itemIndex, set)
  );
}

function badgesForFilter(filter: FilterEntry): ActiveBadge[] {
  const { id, value, set } = filter;
  if (isEmpty(value)) return [];
  if (Array.isArray(value)) return badgesForArray(id, value, set);
  if (isPlainObject(value)) return badgesForObject(id, value, set);
  return [{ id, value: String(value), clear: () => set(null) }];
}

/**
 * Expands a list of generic filter entries into one badge per visible value,
 * plus a `clearAll` that resets every filter to null.
 *
 * Shape-driven, domain-agnostic:
 *   - primitive          -> 1 badge with the value
 *   - object             -> 1 badge per non-empty field ("field value")
 *   - array of primitive -> 1 badge per item
 *   - array of object    -> 1 badge per non-empty field of each item
 *
 * Clearing a single badge produces the smallest change that removes only that
 * value (e.g., clearing "min 5" on a {min,max} object keeps the max). When
 * removing the last visible value, the filter as a whole becomes null.
 *
 * `clearAll` skips the per-badge granularity and resets each filter directly,
 * which is the only correct behavior when multiple badges share the same
 * underlying value (calling each badge's `clear` in sequence would lose
 * intermediate updates due to setter closures over the original value).
 */
export function useActiveBadges(filters: FilterEntry[]): {
  badges: ActiveBadge[];
  clearAll: () => void;
} {
  const stableFilters = useStableValue(filters);
  return useMemo(
    () => ({
      badges: stableFilters.flatMap(badgesForFilter),
      clearAll: () => {
        for (const filter of stableFilters) filter.set(null);
      },
    }),
    [stableFilters]
  );
}
