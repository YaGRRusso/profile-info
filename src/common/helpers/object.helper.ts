/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * key one key from object
 * @param object Object to update
 * @param key Key to remove from object
 * @returns Object without the key
 */
export const removeObjectKey = <T>(object: T, key: keyof T): T => {
  const { [key]: _, ...rest } = object
  return rest as T
}

/**
 * key one key from object
 * @param objects Objects to update
 * @param key Key to remove from object
 * @returns Object without the keys
 */
export const removeObjectsKey = <T>(object: T[], key: keyof T): T[] => {
  return object.map((item) => {
    const { [key]: _, ...rest } = item
    return rest
  }) as T[]
}
