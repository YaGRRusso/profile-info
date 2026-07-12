import type { TFunction } from "i18next";
import type { PageHelpContent } from "@/consts/page-help";
import type enHelp from "@/locales/en/help.json";

export type HelpSection = keyof typeof enHelp;

export function pageHelp(
  tHelp: TFunction<"help">,
  section: HelpSection
): PageHelpContent {
  return {
    title: tHelp(`${section}.title`),
    paragraphs: tHelp(`${section}.paragraphs`, {
      returnObjects: true,
    }) as string[],
  };
}
