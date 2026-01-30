import DataLoader from "dataloader";
import { SkillModel } from "@/schemas/skill.schema";
import { SkillsService } from "@/skills/skills.service";

export type Loaders = ReturnType<typeof createLoaders>;

export function createLoaders({
  skillsService,
}: {
  skillsService: SkillsService;
}) {
  const batchSkills = new DataLoader<string, SkillModel | null>(
    async (ids) => {
      const list = await skillsService.findManyById([...ids]);

      const map = new Map<string, SkillModel>();
      for (const item of list) {
        map.set(item.id.toString(), item);
      }

      return ids.map((id) => map.get(id) ?? null);
    },
    { name: "batchSkills", maxBatchSize: 100 }
  );

  return { batchSkills };
}
