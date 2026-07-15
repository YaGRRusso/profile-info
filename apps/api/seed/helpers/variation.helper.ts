/** Fixed rule for seeds and test data: cycle sizes so every run covers all buckets. */

export const TEXT_SENTENCE_RANGES = {
  large: { max: 20, min: 10 },
  medium: { max: 4, min: 2 },
  small: { max: 1, min: 1 },
} as const;

export const TEXT_WORD_RANGES = {
  large: { max: 24, min: 12 },
  medium: { max: 10, min: 5 },
  small: { max: 4, min: 2 },
} as const;

export const ARRAY_COUNTS = {
  empty: 0,
  large: 12,
  medium: 5,
  short: 2,
} as const;

export type TextSize = keyof typeof TEXT_SENTENCE_RANGES;
export type ArraySize = keyof typeof ARRAY_COUNTS;

const TEXT_SIZES: TextSize[] = ["small", "medium", "large"];
const ARRAY_SIZES: ArraySize[] = ["empty", "short", "medium", "large"];

export function pickTextSize(index: number): TextSize {
  return TEXT_SIZES.at(index % TEXT_SIZES.length) ?? "small";
}

export function pickArraySize(index: number): ArraySize {
  return ARRAY_SIZES.at(index % ARRAY_SIZES.length) ?? "empty";
}

/** Even indices include the value; odd indices omit it (~50% coverage). */
export function optionalForIndex<T>(
  index: number,
  value: () => T
): T | undefined {
  return index % 2 === 0 ? value() : undefined;
}

export function arrayCount(size: ArraySize): number {
  return ARRAY_COUNTS[size];
}

export function arrayBySize<T>(
  size: ArraySize,
  factory: (itemIndex: number) => T
): T[] {
  const count = arrayCount(size);
  return Array.from({ length: count }, (_, itemIndex) => factory(itemIndex));
}
