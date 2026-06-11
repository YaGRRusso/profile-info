import type { ResumeContactLink } from "../types/resume-document.type";

const REDUNDANT_LINK_TITLES = new Set([
  "e-mail",
  "email",
  "mail",
  "phone",
  "tel",
  "telephone",
  "whatsapp",
]);

const LINK_TITLE_LABELS: Record<string, string> = {
  demo: "Demo",
  github: "GitHub",
  linkedin: "LinkedIn",
  other: "Link",
  phone: "Phone",
  repository: "Repository",
  website: "Website",
  whatsapp: "WhatsApp",
};

export function formatLinkTitle(title: string): string {
  const normalized = title.trim().toLowerCase();
  return LINK_TITLE_LABELS[normalized] ?? title.trim();
}

export function filterHeaderLinks(
  urls: ResumeContactLink[]
): ResumeContactLink[] {
  return urls.filter(({ title }) => {
    const normalized = title.trim().toLowerCase();
    return !REDUNDANT_LINK_TITLES.has(normalized);
  });
}
