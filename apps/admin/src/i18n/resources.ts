import enHelp from "@/locales/en/help.json";
import enPages from "@/locales/en/pages.json";
import ptHelp from "@/locales/pt/help.json";
import ptPages from "@/locales/pt/pages.json";

export const i18nResources = {
  en: { help: enHelp, pages: enPages },
  pt: { help: ptHelp, pages: ptPages },
} as const;

export const i18nNamespaces = ["help", "pages"] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];
