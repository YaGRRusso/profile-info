import lodash from "lodash";

type NullableList<T> = T[] | null | undefined;

const indexCollectionByKey = <T extends Record<string, unknown>>(
  items: NullableList<T>,
  lookupKey: keyof T
): Record<string | number, T> => {
  if (!Array.isArray(items)) return {};
  return lodash.keyBy(items, (item) => String(item[lookupKey]));
};

interface FindLabelArgs<T> {
  fallbackValue?: string;
  items: NullableList<T>;
  labelKey: keyof T;
  lookupKey: keyof T;
  targetValue: unknown;
}

export const findLabelById = <T extends Record<string, unknown>>({
  targetValue,
  items,
  lookupKey,
  labelKey,
  fallbackValue = "",
}: FindLabelArgs<T>): string => {
  if (targetValue === null || targetValue === undefined) {
    return fallbackValue;
  }

  const indexedItems = indexCollectionByKey(items, lookupKey);
  const matchedItem = indexedItems[String(targetValue)];

  if (!matchedItem) return fallbackValue;

  return String(lodash.get(matchedItem, labelKey, fallbackValue));
};

interface FindLabelsArgs<T> extends Omit<FindLabelArgs<T>, "targetValue"> {
  targetValues: unknown[] | null | undefined;
}

export const findLabelsByIds = <T extends Record<string, unknown>>({
  targetValues,
  items,
  lookupKey,
  labelKey,
  fallbackValue = "",
}: FindLabelsArgs<T>): string[] => {
  if (!Array.isArray(targetValues)) return [];

  const indexedItems = indexCollectionByKey(items, lookupKey);

  return targetValues.map((value) => {
    if (value === null || value === undefined) return fallbackValue;

    const matchedItem = indexedItems[String(value)];

    if (!matchedItem) return fallbackValue;

    return String(lodash.get(matchedItem, labelKey, fallbackValue));
  });
};
