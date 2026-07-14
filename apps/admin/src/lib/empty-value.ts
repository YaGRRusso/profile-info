import { isNil } from "lodash";

export const EMPTY_MARKER = "—";

export function isEmptyValue(value: unknown): boolean {
  if (isNil(value)) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return false;
  if (Array.isArray(value)) {
    return value.every((item) => isEmptyValue(item));
  }
  return false;
}

export function isNonEmptyString(
  value: string | null | undefined
): value is string {
  return !isNil(value) && value !== "";
}
