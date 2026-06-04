import { DetailInput } from "../dto/detail.input";

/**
 * Transforms a DetailInput object into a formatted string.
 * @param detail The DetailInput object to be transformed.
 * @returns A string formatted as "key: value1, value2, ...".
 * @example
 * const detail: DetailInput = {
 *   key: "Languages",
 *   value: ["JavaScript", "TypeScript"]
 * };
 * const result = createDetail(detail);
 * // result: "Languages: JavaScript, TypeScript"
 */
export function createDetail(detail: DetailInput): string {
  const parsedValue = detail.value.join(", ");
  return `${detail.key}: ${parsedValue}`;
}

/**
 * Transforms an array of DetailInput into an array of formatted strings.
 * @param details An array of DetailInput objects to be transformed.
 * @returns An array of strings formatted as "key: value1, value2, ...".
 * @example
 * const details: DetailInput[] = [
 *   { key: "Languages", value: ["JavaScript", "TypeScript"] },
 *   { key: "Frameworks", value: ["React", "Node"] },
 * ];
 * const result = createDetails(details);
 * // result: [
 * //   "Languages: JavaScript, TypeScript",
 * //   "Frameworks: React, Node"
 * // ]
 */
export function createDetails(details: DetailInput[]): string[] {
  return details.map(createDetail);
}
