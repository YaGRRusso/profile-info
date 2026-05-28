import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { createMultiParser, createParser } from "nuqs";

const RANGE_REGEX = /^-?\d*~-?\d*$/;

export const parseAsSortingState = createParser<SortingState>({
  parse: (str) =>
    str
      .split(",")
      .filter(Boolean)
      .map((part) => ({
        desc: part.startsWith("-"),
        id: part.startsWith("-") ? part.slice(1) : part,
      })),
  serialize: (value) =>
    value.map((s) => (s.desc ? `-${s.id}` : s.id)).join(","),
  eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
});

function serializeFilterValue(value: unknown): string {
  if (Array.isArray(value)) {
    const [min, max] = value as [number | undefined, number | undefined];
    return `${min ?? ""}~${max ?? ""}`;
  }
  return String(value ?? "");
}

function parseFilterValue(str: string): unknown {
  if (str.includes("~") && RANGE_REGEX.test(str)) {
    const [minStr, maxStr] = str.split("~");
    return [
      minStr === "" ? undefined : Number(minStr),
      maxStr === "" ? undefined : Number(maxStr),
    ] as [number | undefined, number | undefined];
  }
  return str;
}

export const parseAsColumnFiltersState = createMultiParser<ColumnFiltersState>({
  parse: (values) => {
    const filters = values.flatMap<ColumnFiltersState[number]>((str) => {
      const sep = str.indexOf(":");
      if (sep === -1) return [];
      const id = str.slice(0, sep);
      return id ? [{ id, value: parseFilterValue(str.slice(sep + 1)) }] : [];
    });
    return filters.length > 0 ? filters : null;
  },
  serialize: (filters) =>
    filters.map(({ id, value }) => `${id}:${serializeFilterValue(value)}`),
  eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
});
