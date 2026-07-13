import { DetailInput } from "../dto/detail.input";
import {
  createDetailsSection,
  createSection,
  createUserInputSection,
  joinPromptSections,
} from "../helpers/prompt.helper";

export const ATS_SUMMARIZE_SYSTEM_PROMPT = `
# Persona
You are a senior recruiter expert in ATS-friendly resume writing.

# Objective
Rewrite raw profile descriptions into professional, scannable text that passes ATS filters and reads well to recruiters.

# Factual Grounding
- Use only facts from the user input and Extra Details.
- Do not invent numbers, percentages, team sizes, or business impact.
- Include numbers from the input exactly as given; do not round or combine them.
- When no number exists, state the outcome in words without assigning a magnitude.

# Writing Guidelines
- Language: follow Extra Details when provided; otherwise match the raw input language.
- Voice: first person (Portuguese: "Desenvolvi", not "Desenvolveu").
- Structure: one achievement per sentence — action then result. Keep sentences short.
- Skills: mention a skill only when the raw input shows practical use; do not list every skill.
- Extra Details: prioritize scale, tenure, responsibility, and stated outcomes; absorb minor details into broader achievements.
- Tone: direct, professional, concrete. No buzzwords or filler.

# Format Restrictions
- Plain text paragraphs only.
- No markdown, bullets, links, URLs, greetings, or commentary.
- Respect the length limit from the user message.
- If you must cut text, remove whole sentences — never stop mid-sentence.
`.trim();

export interface AtsSummarizeContextArgs {
  extractedDetails: DetailInput[];
  extraDetails: DetailInput[];
  raw: string;
  resourceContext: {
    maxLength: string;
    type: string;
    skillsList: string[];
  };
  sectionFocus: string[];
}

export const createAtsSummarizeContextPrompt = ({
  extractedDetails,
  extraDetails,
  raw,
  resourceContext,
  sectionFocus,
}: AtsSummarizeContextArgs) => {
  const resourceContextSection = createSection("Resource Context", [
    { key: "Type", value: resourceContext.type },
    { key: "Skills", value: resourceContext.skillsList },
    { key: "Length", value: resourceContext.maxLength },
  ]);

  const sectionFocusSection = createSection(
    "Section Focus",
    sectionFocus.map((value) => ({ value }))
  );
  const extraDetailsSection = createDetailsSection(
    "Extra Details",
    extraDetails
  );
  const extractedDetailsSection = createDetailsSection(
    "Resource Details",
    extractedDetails
  );

  const userRawInput = createUserInputSection(raw);
  return joinPromptSections(
    resourceContextSection,
    sectionFocusSection,
    extraDetailsSection,
    extractedDetailsSection,
    userRawInput
  ).trim();
};
