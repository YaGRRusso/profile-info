import DataLoader from "dataloader";
import { OrganizationsService } from "@/organizations/organizations.service";
import { OrganizationModel } from "@/schemas/organization.schema";
import { SkillModel } from "@/schemas/skill.schema";
import { SkillsService } from "@/skills/skills.service";

export type Loaders = ReturnType<typeof createLoaders>;

export function createLoaders({
  skillsService,
  organizationsService,
}: {
  skillsService: SkillsService;
  organizationsService: OrganizationsService;
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

  const batchOrganizations = new DataLoader<string, OrganizationModel | null>(
    async (ids) => {
      const list = await organizationsService.findManyById([...ids]);

      const map = new Map<string, OrganizationModel>();
      for (const item of list) {
        map.set(item.id.toString(), item);
      }

      return ids.map((id) => map.get(id) ?? null);
    },
    { name: "batchOrganizations", maxBatchSize: 100 }
  );

  return { batchSkills, batchOrganizations };
}
