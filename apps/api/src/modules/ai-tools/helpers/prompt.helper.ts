import { compact, isNil } from "lodash";

import type { DetailInput } from "../dto/detail.input";

export interface PromptLine {
  key?: string;
  value: string | string[] | undefined;
}

function formatLine({ key, value }: PromptLine): string | undefined {
  if (isNil(value) || value === "") return;
  if (Array.isArray(value) && value.length === 0) return;

  const text = Array.isArray(value) ? value.join(", ") : value;
  return key ? `${key}: ${text}` : text;
}

export function createSection(
  title: string,
  lines: PromptLine[]
): string | undefined {
  const bullets = compact(lines.map(formatLine)).map((line) => `- ${line}`);
  if (bullets.length === 0) return;

  return `# ${title}\n${bullets.join("\n")}`;
}

export function createDetailsSection(
  title: string,
  details: DetailInput[]
): string | undefined {
  return createSection(
    title,
    details.map(({ key, value }) => ({ key, value }))
  );
}

export function createUserInputSection(raw: string): string {
  return `---\n\n# User Raw Input\n<user_input>\n${raw}\n</user_input>`;
}

export function joinPromptSections(
  ...sections: Array<string | undefined | null | false>
): string {
  return compact(sections).join("\n\n");
}
