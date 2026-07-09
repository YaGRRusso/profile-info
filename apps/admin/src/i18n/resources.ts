import enHelp from "@/locales/en/help.json";
import enNav from "@/locales/en/nav.json";
import enPages from "@/locales/en/pages.json";
import ptHelp from "@/locales/pt/help.json";
import ptNav from "@/locales/pt/nav.json";
import ptPages from "@/locales/pt/pages.json";

export const i18nResources = {
  en: { help: enHelp, nav: enNav, pages: enPages },
  pt: { help: ptHelp, nav: ptNav, pages: ptPages },
} as const;

export const i18nNamespaces = ["help", "nav", "pages"] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];
