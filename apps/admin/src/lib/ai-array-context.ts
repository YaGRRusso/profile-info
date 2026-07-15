import { compact } from "lodash";
import type { ContextMode, DetailInput } from "@/generated/graphql/graphql";

export function isContextArrayIndex(index: number): boolean {
  return index === 0;
}

export function arrayContextDetails(options: {
  contextMode: ContextMode;
  key: string;
  values: Array<string | null | undefined>;
}): DetailInput[] {
  const values = compact(options.values.map((value) => value?.trim()));
  if (values.length === 0) return [];

  const [first, ...rest] = values;
  const details: DetailInput[] = [
    {
      contextMode: options.contextMode,
      key: options.key,
      value: [first],
    },
  ];

  if (rest.length > 0) {
    details.push({
      key: options.key,
      value: rest,
    });
  }

  return details;
}
