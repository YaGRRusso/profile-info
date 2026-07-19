import type {
  AppLoaders,
  AppRequest,
} from "@/core/context/graphql-context.interface";
import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";
import { UsersLoaderService } from "@/modules/users/users-loader.service";

export class LoadersService {
  constructor(
    private readonly skillsLoaderService: SkillsLoaderService,
    private readonly organizationsLoaderService: OrganizationsLoaderService,
    private readonly usersLoaderService: UsersLoaderService
  ) {}

  createLoaders(req: AppRequest): AppLoaders {
    return {
      batchOrganizations: this.organizationsLoaderService.createLoader(req),
      batchSkills: this.skillsLoaderService.createLoader(req),
      batchUserOwnedCounts: this.usersLoaderService.createOwnedCountsLoader(),
      batchUsers: this.usersLoaderService.createLoader(),
    };
  }
}
