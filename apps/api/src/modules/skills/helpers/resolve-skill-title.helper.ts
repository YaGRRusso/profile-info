import { pickTranslation } from "@/common/helpers/pick-translation.helper";
import type { LocaleCode } from "@/common/i18n/locales";
import type { SkillEntityRecord } from "../entities/skill.entity";

export function resolveSkillTitle(
  skill: Pick<SkillEntityRecord, "slug" | "i18n">,
  locale: LocaleCode | string
): string {
  return pickTranslation(skill.i18n, locale)?.messages.title ?? skill.slug;
}
