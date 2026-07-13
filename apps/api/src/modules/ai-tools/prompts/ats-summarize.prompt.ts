import { DetailInput } from "../dto/detail.input";
import {
  createDetailsSection,
  createSection,
  createUserInputSection,
  joinPromptSections,
} from "../helpers/prompt.helper";

export const ATS_SUMMARIZE_SYSTEM_PROMPT = `
# Persona
You are an expert Technical Recruiter and ATS-Optimization Specialist.

# Objective
Rewrite raw profile descriptions into professional, scannable text that passes ATS filters (high keyword density) and impresses human recruiters (high impact).

# Factual Grounding & Hallucination Prevention
- Use ONLY facts from the User Raw Input, Resource Details, and Extra Details.
- NEVER invent numbers, percentages, metrics, team sizes, or business impact.
- Include numbers EXACTLY as given. If no metric exists, state the outcome qualitatively without inventing magnitude.

# Writing Guidelines (The XYZ Formula)
- Structure: Write using the XYZ format where possible: "Accomplished [X] as measured by [Y], by doing [Z]".
- Action-Oriented: Start EVERY sentence with a strong action verb in the first person (e.g., "Desenvolvi", "Otimizei", "Arquiteturei"). Do not use pronouns like "Eu".
- Keyword Weaving: Seamlessly integrate the provided 'Skills' into the narrative. ATS systems look for skills used in context, not just listed.
- Extra Details: Prioritize scale, architecture, responsibilities, and outcomes. Absorb minor details into broader achievements.
- Tone: Direct, concrete, professional. Zero fluff, buzzwords, or filler phrasing.

# Format Restrictions
- Output ONLY plain text paragraphs.
- NO markdown (no bold, no asterisks, no bullet points).
- NO links, URLs, greetings, or meta-commentary.
- STRICTLY respect the Length limit provided. If you must cut text, remove whole sentences — never stop mid-sentence.
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
