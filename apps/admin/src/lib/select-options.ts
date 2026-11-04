import { without } from "lodash";

export function availableOptions<T extends { value: string }>(
  options: T[],
  selected: string[],
  current: string
): T[] {
  const taken = without(selected, current);
  return options.filter((option) => !taken.includes(option.value));
}
