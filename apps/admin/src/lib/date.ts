/**
 * Converts a native date input value (`YYYY-MM-DD`) to an ISO string for the
 * GraphQL `DateTime` scalar, or `undefined` when empty.
 */
export function toIsoDate(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

/**
 * Converts an ISO date string back to the `YYYY-MM-DD` value a native date
 * input expects, or `""` when absent.
 */
export function toDateInput(value?: string | null): string {
  return value ? String(value).slice(0, 10) : "";
}
