import { groupBy, orderBy } from "lodash";
import type { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { RESUME_LIMITS } from "../const/resume-limits.const";
import type { ResumeSkillGroup } from "../types/resume-document.type";

export function selectResumeSkillGroups(
  skills: SkillEntity[]
): ResumeSkillGroup[] {
  const grouped = groupBy(skills, (skill) => skill.category);

  return orderBy(
    Object.entries(grouped)
      .map(([category, items]) => ({
        category,
        skills: orderBy(items, ["relevance", "updatedAt"], ["desc", "desc"])
          .slice(0, RESUME_LIMITS.skillsPerCategory)
          .map((item) => item.name),
      }))
      .filter((group) => group.skills.length > 0),
    ["category"],
    ["asc"]
  );
}
