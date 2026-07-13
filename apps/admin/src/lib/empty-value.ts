export const EMPTY_MARKER = "—";

export function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return false;
  if (Array.isArray(value)) {
    return value.every((item) => isEmptyValue(item));
  }
  return false;
}
