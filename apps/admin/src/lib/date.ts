const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP_PATTERN = /^\d+$/;

/**
 * Converts a native date input value (`YYYY-MM-DD`) to an ISO string for the
 * GraphQL `DateTime` scalar, or `undefined` when empty.
 */
export function toIsoDate(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

/**
 * Converts an API date value back to the `YYYY-MM-DD` format a native date
 * input expects, or `""` when absent.
 *
 * Handles ISO strings, date-only strings, and millisecond timestamps returned
 * as strings from GraphQL `String` fields backed by MongoDB `Date` values.
 */
export function toDateInput(value?: string | null): string {
  if (!value) return "";

  if (DATE_INPUT_PATTERN.test(value)) return value;

  const date = TIMESTAMP_PATTERN.test(value)
    ? new Date(Number(value))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}
