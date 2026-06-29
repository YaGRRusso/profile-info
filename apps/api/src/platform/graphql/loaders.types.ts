import type DataLoader from "dataloader";
import type { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import type { SkillEntity } from "@/modules/skills/entities/skill.entity";
import type { UserEntity } from "@/modules/users/entities/user.entity";

export interface Loaders {
  batchOrganizations: DataLoader<string, OrganizationEntity | null>;
  batchSkills: DataLoader<string, SkillEntity | null>;
  batchUsers: DataLoader<string, UserEntity | null>;
}
