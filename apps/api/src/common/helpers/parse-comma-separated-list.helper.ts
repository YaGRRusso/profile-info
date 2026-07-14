import { compact } from "lodash";

export function parseCommaSeparatedList(value: string): string[] {
  return compact(value.split(",").map((item) => item.trim()));
}
