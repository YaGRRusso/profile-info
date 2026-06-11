import { truncate } from "lodash";

const DEFAULT_OMISSION = "...";
const WORD_BOUNDARY = /\s+/;

export function truncateText(text: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (text.length <= maxLength) return text;

  const omission = maxLength >= DEFAULT_OMISSION.length ? DEFAULT_OMISSION : "";

  return truncate(text, {
    length: maxLength,
    omission,
    separator: WORD_BOUNDARY,
  });
}
