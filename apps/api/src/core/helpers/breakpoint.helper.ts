export function breakpoint(message?: unknown) {
  console.dir(message, { depth: null });
  throw new Error("Breakpoint Reached");
}
