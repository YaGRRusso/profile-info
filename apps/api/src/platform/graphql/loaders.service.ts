import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";
import { UsersLoaderService } from "@/modules/users/users-loader.service";
import type { Loaders } from "./loaders.types";

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
