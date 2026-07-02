import { groupBy, orderBy } from "lodash";
import type { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { RESUME_LIMITS } from "../const/resume-limits.const";
import type { ResumeSkillGroup } from "../types/resume-document.type";

export function selectResumeSkillGroups(
  skills: SkillEntity[]
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
          .map((item) => item.name),
      }))
      .filter((group) => group.skills.length > 0),
    [(group) => group.category ?? ""],
    ["asc"]
  );
}
