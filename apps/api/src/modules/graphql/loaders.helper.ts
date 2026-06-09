import DataLoader from "dataloader";
import { keyBy } from "lodash";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { SkillsService } from "@/modules/skills/skills.service";

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
      const map = keyBy(list, (item) => item.id.toString());
      return ids.map((id) => map[id] ?? null);
    },
    { name: "batchSkills", maxBatchSize: 100 }
  );

  const batchOrganizations = new DataLoader<string, OrganizationModel | null>(
    async (ids) => {
      const list = await organizationsService.findManyById([...ids]);
      const map = keyBy(list, (item) => item.id.toString());
      return ids.map((id) => map[id] ?? null);
    },
    { name: "batchOrganizations", maxBatchSize: 100 }
  );

  return { batchSkills, batchOrganizations };
}
