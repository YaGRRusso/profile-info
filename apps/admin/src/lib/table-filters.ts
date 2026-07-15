import type { Row } from "@tanstack/react-table";
import { isNil } from "lodash";

function parseNumberRange(value: unknown): {
  max?: number;
  min?: number;
} | null {
  if (!Array.isArray(value) || value.length !== 2) return null;

  const [min, max] = value;
  if (!(min === undefined || typeof min === "number")) return null;
  if (!(max === undefined || typeof max === "number")) return null;

  return { max, min };
}

/**
 * Keeps rows whose numeric column value falls within an optional [min, max]
 * range. Opt-in per column via `filterFn: numberRangeFilter`.
 */
export function numberRangeFilter<TData>(
  row: Row<TData>,
  columnId: string,
  value: unknown
): boolean {
  const rowValue = row.getValue<number | null>(columnId);
  if (isNil(rowValue)) return false;

  const range = parseNumberRange(value);
  if (!range) return true;

  const { min, max } = range;
  if (min !== undefined && rowValue < min) return false;
  if (max !== undefined && rowValue > max) return false;
  return true;
}

/**
 * Keeps rows whose date column falls within a named window ("week" | "month").
 * Opt-in per column via `filterFn: dateRangeFilter`.
 */
export function dateRangeFilter<TData>(
  row: Row<TData>,
  columnId: string,
  value: unknown
): boolean {
  const date = new Date(row.getValue(columnId));
  const now = new Date();
  switch (value) {
    case "week":
      return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    default:
      return true;
  }
}
