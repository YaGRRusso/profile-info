import { isNil } from "lodash";

/**
 * Omits empty strings from GraphQL variables (field unchanged on partial update).
 * Use only when an empty value does not mean "clear" — e.g. password is never
 * pre-filled, so blank always means "do not change".
 */
export function omitIfEmpty(value: string): string | undefined {
  return value || undefined;
}

/** Cleared optional form value → `null` so updates persist the empty state. */
export function nullIfEmpty<T>(value: T): T | null {
  if (isNil(value) || value === "") return null;
  if (Array.isArray(value) && value.length === 0) return null;
  if (value === 0) return null;
  return value;
}
