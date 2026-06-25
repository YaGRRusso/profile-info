export function mapPage<T, U>(
  page: { found: number; nodes: T[] },
  map: (item: T) => U
): { found: number; nodes: U[] } {
  return {
    found: page.found,
    nodes: page.nodes.map(map),
  };
}
