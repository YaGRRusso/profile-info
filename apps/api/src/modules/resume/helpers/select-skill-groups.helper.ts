import { groupBy, orderBy } from "lodash";
import type { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { RESUME_LIMITS } from "../resume.constants";
import type { ResumeSkillGroup } from "../types/resume-document.type";

export function selectResumeSkillGroups(
  skills: SkillModel[]
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
