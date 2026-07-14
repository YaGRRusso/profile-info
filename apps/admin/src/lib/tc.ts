type FunctionProps<Result> = Promise<Result> | (() => Promise<Result>);
type FallbackProps = (error: unknown) => void;

export const tc = async <Result>(
  fn: FunctionProps<Result>,
  fallback?: FallbackProps
): Promise<Result | undefined> => {
  try {
    return typeof fn === "function" ? await fn() : await fn;
  } catch (error) {
    console.error(error);
    fallback?.(error);
  }
};
