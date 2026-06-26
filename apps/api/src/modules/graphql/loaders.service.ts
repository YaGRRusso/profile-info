import type DataLoader from "dataloader";
import type { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import type { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";

import type { UserEntity } from "@/modules/users/entities/user.entity";
import { UsersLoaderService } from "@/modules/users/users-loader.service";

export interface Loaders {
  batchOrganizations: DataLoader<string, OrganizationEntity | null>;
  batchSkills: DataLoader<string, SkillEntity | null>;
  batchUsers: DataLoader<string, UserEntity | null>;
}

export class LoadersService {
  constructor(
    private readonly skillsLoaderService: SkillsLoaderService,
    private readonly organizationsLoaderService: OrganizationsLoaderService,
    private readonly usersLoaderService: UsersLoaderService
  ) {}

  createLoaders(): Loaders {
    return {
      batchSkills: this.skillsLoaderService.createLoader(),
      batchOrganizations: this.organizationsLoaderService.createLoader(),
      batchUsers: this.usersLoaderService.createLoader(),
    };
  }
}
