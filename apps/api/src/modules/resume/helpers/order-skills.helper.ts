import { keyBy } from "lodash";
import type { SkillEntity } from "@/modules/skills/entities/skill.entity";

export function orderSkillsByIds(
  skillIds: string[],
  skills: SkillEntity[]
): SkillEntity[] {
  const map = keyBy(skills, (skill) => skill.id);
  return skillIds
    .map((id) => map[id])
    .filter((skill): skill is SkillEntity => skill != null);
}
