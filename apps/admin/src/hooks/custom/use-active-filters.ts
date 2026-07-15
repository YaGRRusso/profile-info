import { isNil, isPlainObject } from "lodash";
import { useMemo } from "react";
import { useStableValue } from "@/hooks/custom/use-stable-value";

export interface ActiveFilter {
  clear: () => void;
  id: string;
  value: string;
}

export interface FilterEntry<Value = unknown> {
  id: string;
  label?: string;
  setState: (next: Value | null) => void;
  state: Value;
}

interface FilterPreview {
  display: string;
  valueAfterClear: unknown;
}

function isEmpty(value: unknown): boolean {
  return isNil(value) || value === "";
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
): FilterPreview[] {
  return nonEmptyEntries(objectValue).map(([fieldKey, fieldValue]) => ({
    display: `${fieldKey} ${fieldValue}`,
    valueAfterClear: objectWithoutField(objectValue, fieldKey),
  }));
}

function previewsFromArray(items: unknown[]): FilterPreview[] {
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

function previewsFromValue(value: unknown): FilterPreview[] {
  if (isEmpty(value)) return [];
  if (Array.isArray(value)) return previewsFromArray(value);
  if (isPlainObject(value)) {
    return previewsFromObject(value as Record<string, unknown>);
  }

  return [{ display: String(value), valueAfterClear: null }];
}

function filterForFilter({
  id,
  label,
  state,
  setState,
}: FilterEntry): ActiveFilter[] {
  return previewsFromValue(state).map(({ display, valueAfterClear }) => ({
    clear: () => setState(valueAfterClear),
    id,
    value: label ? `${label}: ${display}` : display,
  }));
}

/**
 *   primitive          -> 1 filter with the value
 *   object             -> 1 filter per non-empty field ("field value")
 *   array of primitive -> 1 filter per item
 *   array of object    -> 1 filter per non-empty field of each item
 */
export function useActiveFilters(filters: FilterEntry[]): {
  filters: ActiveFilter[];
  clearAll: () => void;
} {
  const stableFilters = useStableValue(filters);
  return useMemo(
    () => ({
      clearAll: () => {
        for (const filter of stableFilters) filter.setState(null);
      },
      filters: stableFilters.flatMap(filterForFilter),
    }),
    [stableFilters]
  );
}
