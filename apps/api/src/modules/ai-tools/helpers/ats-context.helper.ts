import { ResourceType } from "../enums/resource-type";

const DEFAULT_LENGTH_BUDGET = "150 to 300 characters (1 to 3 sentences)";

const LENGTH_BUDGETS: Partial<Record<ResourceType, string>> = {
  [ResourceType.EXPERIENCE]: "500 to 900 characters (4 to 7 sentences)",
  [ResourceType.PROJECT]: "300 to 600 characters (2 to 5 sentences)",
  [ResourceType.EDUCATION]: "200 to 400 characters (2 to 3 sentences)",
  [ResourceType.COURSE]: "150 to 300 characters (1 to 3 sentences)",
  [ResourceType.USER]: "400 to 700 characters (3 to 5 sentences)",
};

const TYPE_SPECIFIC_RULES: Partial<Record<ResourceType, string[]>> = {
  [ResourceType.USER]: [
    "Open with the job title from Extra Details.",
    "Add one or two ATS-friendly title variants recruiters search for, in the same language as the output.",
    "Highlight end-to-end technical scope and the strongest differentiators.",
    "Use leadership verbs only when the input supports them (e.g. architecture, migrations, standards).",
  ],
  [ResourceType.EXPERIENCE]: [
    "Prioritize impact on the product, team, or delivery.",
    "Surface architecture ownership, technical decisions, code review, or mentoring only when the input supports it.",
    "Write multiple distinct achievements; each sentence ends with its outcome.",
  ],
  [ResourceType.PROJECT]: [
    "State what was built, the problem solved, and the stack in context.",
    "End each achievement with a concrete result from the input.",
  ],
  [ResourceType.EDUCATION]: [
    "Focus on applied skills and hands-on outcomes — not generic curriculum praise.",
  ],
  [ResourceType.COURSE]: [
    "Focus on applied skills and hands-on outcomes — not generic curriculum praise.",
  ],
};

export function createAtsSummarizeLengthBudget(type: ResourceType): string {
  return LENGTH_BUDGETS[type] ?? DEFAULT_LENGTH_BUDGET;
}

export function createAtsSummarizeTypeRules(type: ResourceType): string[] {
  return TYPE_SPECIFIC_RULES[type] ?? [];
}
