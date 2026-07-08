import { keyBy } from "lodash";
import type { SkillEntityRecord } from "@/modules/skills/entities/skill.entity";

export function orderSkillsByIds(
  skillIds: string[],
  skills: SkillEntityRecord[]
): SkillEntityRecord[] {
  const map = keyBy(skills, (skill) => skill.id);
  return skillIds
    .map((id) => map[id])
    .filter((skill): skill is SkillEntityRecord => skill != null);
}
