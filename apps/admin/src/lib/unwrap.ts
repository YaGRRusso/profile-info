type Unwrap<Result extends object> = Result[keyof Result];

export function unwrap<Result extends object>(
  object: Result | null | undefined
): Unwrap<Result> | undefined {
  if (!object) return;
  const key = Object.keys(object)[0] as keyof Result;
  return object[key] as Unwrap<Result>;
}
