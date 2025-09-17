import DataLoader from "dataloader";
import type { Skill } from "@/skills/entities/skill.entity";
import { SkillsService } from "@/skills/skills.service";

export type Loaders = ReturnType<typeof createLoaders>;

export function createLoaders({ skillsService }: { skillsService: SkillsService }) {
  const batchSkills = new DataLoader<string, Skill | null>(async (ids) => {
    const skills = await skillsService.findMany(ids as string[]);

    const skillsMap = new Map<string, Skill>();
    for (const skill of skills) {
      // @ts-expect-error
      skillsMap.set(skill.id.toString(), skill);
    }

    const results: Array<Skill | null> = [];
    for (const id of ids) {
      results.push(skillsMap.get(id.toString()) ?? null);
    }
    return results;
  });

  return { batchSkills };
}
