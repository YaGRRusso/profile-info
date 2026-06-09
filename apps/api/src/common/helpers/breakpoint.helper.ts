export function breakpoint(message?: unknown, title = "Breakpoint Reached") {
  console.dir(message, { depth: null });
  throw new Error(title);
}
