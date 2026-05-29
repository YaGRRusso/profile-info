import { useMemo } from "react";
import { useStableValue } from "@/lib/use-stable-value";

export interface ActiveBadge {
  clear: () => void;
  id: string;
  value: string;
}

export interface FilterEntry<Value = unknown> {
  id: string;
  setState(next: Value | null): void;
  state: Value;
}

interface BadgePreview {
  display: string;
  valueAfterClear: unknown;
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

function nonEmptyEntries(
  objectValue: Record<string, unknown>
): [string, unknown][] {
  return Object.entries(objectValue).filter(
    ([, fieldValue]) => !isEmpty(fieldValue)
  );
}

function objectWithoutField(
  objectValue: Record<string, unknown>,
  fieldKey: string
): Record<string, unknown> | null {
  const next = { ...objectValue, [fieldKey]: undefined };
  return nonEmptyEntries(next).length ? next : null;
}

function arrayWithItemReplaced(
  items: unknown[],
  itemIndex: number,
  replacement: unknown
): unknown[] | null {
  const next =
    replacement === null
      ? items.filter((_, currentIndex) => currentIndex !== itemIndex)
      : items.map((current, currentIndex) =>
          currentIndex === itemIndex ? replacement : current
        );
  return next.length ? next : null;
}

function previewsFromObject(
  objectValue: Record<string, unknown>
): BadgePreview[] {
  return nonEmptyEntries(objectValue).map(([fieldKey, fieldValue]) => ({
    display: `${fieldKey} ${fieldValue}`,
    valueAfterClear: objectWithoutField(objectValue, fieldKey),
  }));
}

function previewsFromArray(items: unknown[]): BadgePreview[] {
  return items.flatMap((item, itemIndex) =>
    previewsFromValue(item).map((itemPreview) => ({
      display: itemPreview.display,
      valueAfterClear: arrayWithItemReplaced(
        items,
        itemIndex,
        itemPreview.valueAfterClear
      ),
    }))
  );
}

function previewsFromValue(value: unknown): BadgePreview[] {
  if (isEmpty(value)) return [];
  if (Array.isArray(value)) return previewsFromArray(value);
  if (isPlainObject(value)) return previewsFromObject(value);
  return [{ display: String(value), valueAfterClear: null }];
}

function badgesForFilter({ id, state, setState }: FilterEntry): ActiveBadge[] {
  return previewsFromValue(state).map(({ display, valueAfterClear }) => ({
    id,
    value: display,
    clear: () => setState(valueAfterClear),
  }));
}

/**
 *   primitive          -> 1 badge with the value
 *   object             -> 1 badge per non-empty field ("field value")
 *   array of primitive -> 1 badge per item
 *   array of object    -> 1 badge per non-empty field of each item
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
        for (const filter of stableFilters) filter.setState(null);
      },
    }),
    [stableFilters]
  );
}
