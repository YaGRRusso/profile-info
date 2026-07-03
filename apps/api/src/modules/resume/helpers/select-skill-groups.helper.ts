import { groupBy, orderBy } from "lodash";
import type { LocaleCode } from "@/common/i18n/locales";
import type { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { resolveSkillTitle } from "@/modules/skills/helpers/resolve-skill-title.helper";
import { RESUME_LIMITS } from "../const/resume-limits.const";
import type { ResumeSkillGroup } from "../types/resume-document.type";

export function selectResumeSkillGroups(
  skills: SkillEntity[],
  locale: LocaleCode | string
): ResumeSkillGroup[] {
  const orderIndex = new Map(skills.map((skill, index) => [skill.id, index]));
  const grouped = groupBy(skills, (skill) => skill.category ?? "");

  return orderBy(
    Object.entries(grouped)
      .map(([category, items]) => ({
        category,
        skills: orderBy(
          items,
          [(item) => orderIndex.get(item.id) ?? 0],
          ["asc"]
        )
          .slice(0, RESUME_LIMITS.skillsPerCategory)
          .map((item) => resolveSkillTitle(item, locale)),
      }))
      .filter((group) => group.skills.length > 0),
    [(group) => (group.category ? 1 : 0), (group) => group.category],
    ["asc", "asc"]
  );
}
