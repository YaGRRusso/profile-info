import { useTranslation } from "react-i18next";
import type { PageHelpContent, PageHelpKey } from "@/consts/page-help";

export function usePageHelp(key: PageHelpKey): PageHelpContent {
  const { t } = useTranslation("help");

  return {
    title: t(`${key}.title`),
    paragraphs: t(`${key}.paragraphs`, { returnObjects: true }) as string[],
  };
}
