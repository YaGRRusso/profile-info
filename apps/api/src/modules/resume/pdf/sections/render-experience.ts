import {
  entryBlockSectionHandlers,
  renderSection,
} from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import type {
  ResumeDocumentData,
  ResumeExperience,
  ResumeExperienceRole,
} from "../../types/resume-document.type";

interface ExperienceRoleEntry {
  experience: ResumeExperience;
  role: ResumeExperienceRole;
}

function flattenExperienceRoles(
  experiences: ResumeExperience[]
): ExperienceRoleEntry[] {
  return experiences.flatMap((experience) =>
    experience.roles.map((role) => ({ experience, role }))
  );
}

export function renderExperiences(
  ctx: PdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: flattenExperienceRoles(document.experiences),
    title,
    ...entryBlockSectionHandlers<ExperienceRoleEntry>(
      ({ experience, role }) => ({
        title: role.title,
        meta: [experience.organization, role.period],
        description: role.description,
      })
    ),
  });
}
