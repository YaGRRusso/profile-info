import type { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import type { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import type { SkillModel } from "@/modules/skills/schemas/skill.schema";
import type { SkillsLoaderService } from "@/modules/skills/skills-loader.service";
import type DataLoader from "dataloader";

export type Loaders = {
  batchSkills: DataLoader<string, SkillModel | null>;
  batchOrganizations: DataLoader<string, OrganizationModel | null>;
};

export function composeLoaders({
  skillsLoaderService,
  organizationsLoaderService,
}: {
  skillsLoaderService: SkillsLoaderService;
  organizationsLoaderService: OrganizationsLoaderService;
}): Loaders {
  return {
    batchSkills: skillsLoaderService.createLoader(),
    batchOrganizations: organizationsLoaderService.createLoader(),
  };
}
