import type DataLoader from "dataloader";
import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import type { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import type { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";

export interface Loaders {
  batchOrganizations: DataLoader<string, OrganizationModel | null>;
  batchSkills: DataLoader<string, SkillModel | null>;
}

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
