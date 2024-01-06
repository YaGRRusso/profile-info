/**
 * Connect one id from foreign table
 * @param values Foreign table row id
 * @returns Formatted prisma connection
 */
export const connectOne = (value: string) => ({
  connect: { id: value },
})

/**
 * Connect many ids from foreign tables
 * @param values Foreign table rows id
 * @returns Formatted prisma connection
 */
export const connectMany = (values: string[]) => ({
  connect: [...values].map((value) => ({ id: value })),
})
