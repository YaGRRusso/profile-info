import { ResourceType } from "../enums/resource-type";

const DEFAULT_LENGTH_BUDGET =
  "150 to 300 characters (STRICTLY 1 to 2 sentences).";

const LENGTH_BUDGETS: Partial<Record<ResourceType, string>> = {
  [ResourceType.EXPERIENCE]:
    "500 to 900 characters (STRICTLY 4 to 6 sentences).",
  [ResourceType.PROJECT]: "300 to 600 characters (STRICTLY 2 to 4 sentences).",
  [ResourceType.EDUCATION]:
    "200 to 400 characters (STRICTLY 2 to 3 sentences).",
  [ResourceType.COURSE]: "150 to 300 characters (STRICTLY 1 to 2 sentences).",
  [ResourceType.USER]: "400 to 700 characters (STRICTLY 3 to 4 sentences).",
};

const TYPE_SPECIFIC_RULES: Partial<Record<ResourceType, string[]>> = {
  [ResourceType.USER]: [
    "Open with the target job title (from Extra Details or Context).",
    "Include 1-2 ATS-friendly title variants (e.g., Software Engineer, Desenvolvedor Full-Stack) in the output language.",
    "Highlight core competencies, years of experience, and strongest differentiators.",
    "Do NOT use project-specific deep dives here; focus on the macro professional identity.",
  ],
  [ResourceType.EXPERIENCE]: [
    "Focus heavily on business impact, product delivery, and technical challenges solved.",
    "Surface architecture ownership, technical decisions, CI/CD, code review, or mentoring if supported by input.",
    "Ensure each sentence demonstrates a clear problem-action-result flow.",
  ],
  [ResourceType.PROJECT]: [
    "State the problem solved, the specific tech stack used, and the final deliverable.",
    "Highlight full-stack scope (e.g., Frontend to Backend/Infrastructure) if applicable.",
  ],
  [ResourceType.EDUCATION]: [
    "Highlight applied skills, capstone projects, or specific hands-on technologies learned.",
    "Avoid generic curriculum descriptions; focus on what the user actually built or researched.",
  ],
  [ResourceType.COURSE]: [
    "Focus strictly on practical application. What can the user do now that they couldn't before?",
  ],
};

export function createAtsSummarizeLengthBudget(type: ResourceType): string {
  return LENGTH_BUDGETS[type] ?? DEFAULT_LENGTH_BUDGET;
}

export function createAtsSummarizeTypeRules(type: ResourceType): string[] {
  return TYPE_SPECIFIC_RULES[type] ?? [];
}
