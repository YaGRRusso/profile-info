type Unwrap<T> = T[keyof T];

export function unwrap<T extends Record<string, unknown>>(
  object: T
): Unwrap<T> {
  if (object) {
    const key = Object.keys(object)[0];
    return object[key] as Unwrap<T>;
  }

  return {} as Unwrap<T>;
}
