/**
 * Connect many ids from foreign tables
 * @param values Foreign table rows id
 * @returns Formatted prisma connection
 */
export const manyIds = (values: string[]): { id: string }[] =>
  [...values].map((value) => ({ id: value }))
