export interface RecentActivityRecord {
  label: string;
  updatedAt: Date;
}

interface I18nWithTitle {
  messages?: { title?: string };
}

export function labelFromI18nTitle(
  slug: string,
  i18n?: I18nWithTitle[]
): string {
  return i18n?.[0]?.messages?.title ?? slug;
}
