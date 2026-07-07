import type { AuthContext } from "@/core/context/auth-context.interface";
import type { AppLoaders } from "@/core/context/graphql-context.interface";
import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";
import { UsersLoaderService } from "@/modules/users/users-loader.service";

export class LoadersService {
  constructor(
    private readonly skillsLoaderService: SkillsLoaderService,
    private readonly organizationsLoaderService: OrganizationsLoaderService,
    private readonly usersLoaderService: UsersLoaderService
  ) {}

  createLoaders(resolveCtx: () => AuthContext | undefined): AppLoaders {
    return {
      batchSkills: this.skillsLoaderService.createLoader(resolveCtx),
      batchOrganizations:
        this.organizationsLoaderService.createLoader(resolveCtx),
      batchUsers: this.usersLoaderService.createLoader(),
    };
  }
}
