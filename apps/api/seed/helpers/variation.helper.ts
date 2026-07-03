/** Fixed rule for seeds and test data: cycle sizes so every run covers all buckets. */

export const TEXT_SENTENCE_RANGES = {
  small: { min: 1, max: 1 },
  medium: { min: 2, max: 4 },
  large: { min: 10, max: 20 },
} as const;

export const TEXT_WORD_RANGES = {
  small: { min: 2, max: 4 },
  medium: { min: 5, max: 10 },
  large: { min: 12, max: 24 },
} as const;

export const ARRAY_COUNTS = {
  empty: 0,
  short: 2,
  medium: 5,
  large: 12,
} as const;

export type TextSize = keyof typeof TEXT_SENTENCE_RANGES;
export type ArraySize = keyof typeof ARRAY_COUNTS;

const TEXT_SIZES: TextSize[] = ["small", "medium", "large"];
const ARRAY_SIZES: ArraySize[] = ["empty", "short", "medium", "large"];

export function pickTextSize(index: number): TextSize {
  return TEXT_SIZES[index % TEXT_SIZES.length]!;
}

export function pickArraySize(index: number): ArraySize {
  return ARRAY_SIZES[index % ARRAY_SIZES.length]!;
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
