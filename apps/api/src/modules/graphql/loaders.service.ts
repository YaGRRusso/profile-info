import type DataLoader from "dataloader";
import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import type { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";
import type { SkillModel } from "@/modules/skills/schemas/skill.schema";

export type Loaders = {
  batchSkills: DataLoader<string, SkillModel | null>;
  batchOrganizations: DataLoader<string, OrganizationModel | null>;
};

export class LoadersService {
  constructor(
    private readonly skillsLoaderService: SkillsLoaderService,
    private readonly organizationsLoaderService: OrganizationsLoaderService
  ) {}

  createLoaders(): Loaders {
    return {
      batchSkills: this.skillsLoaderService.createLoader(),
      batchOrganizations: this.organizationsLoaderService.createLoader(),
    };
  }
}
