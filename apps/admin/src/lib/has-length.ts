export function hasLength(
  value?: string,
  { min, max }: { max?: number; min?: number } = {}
): boolean {
  if (!value) return false;

  const { length } = value.trim();

  if (min !== undefined && length < min) return false;
  if (max !== undefined && length > max) return false;

  return true;
}
