/** biome-ignore-all lint/complexity/noUselessEmptyExport: biome does not support augmentation of global interfaces */
import type DataLoader from "dataloader";
import type { OrganizationEntityRecord } from "@/modules/organizations/entities/organization.entity";
import type { SkillEntityRecord } from "@/modules/skills/entities/skill.entity";
import type { UserEntityRecord } from "@/modules/users/entities/user.entity";
import type { UserOwnedCounts } from "@/modules/users/entities/user-owned-counts.entity";

declare module "@/core/context/graphql-context.interface" {
  interface AppLoaders {
    batchOrganizations: DataLoader<string, OrganizationEntityRecord | null>;
    batchSkills: DataLoader<string, SkillEntityRecord | null>;
    batchUserOwnedCounts: DataLoader<string, UserOwnedCounts>;
    batchUsers: DataLoader<string, UserEntityRecord | null>;
  }
}

export {};
