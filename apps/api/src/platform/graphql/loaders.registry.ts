/** biome-ignore-all lint/complexity/noUselessEmptyExport: biome does not support augmentation of global interfaces */
import type DataLoader from "dataloader";
import type { OrganizationEntityRecord } from "@/modules/organizations/entities/organization.entity";
import type { SkillEntityRecord } from "@/modules/skills/entities/skill.entity";
import type { UserEntityRecord } from "@/modules/users/entities/user.entity";

declare module "@/core/context/graphql-context.interface" {
  interface AppLoaders {
    batchOrganizations: DataLoader<string, OrganizationEntityRecord | null>;
    batchSkills: DataLoader<string, SkillEntityRecord | null>;
    batchUsers: DataLoader<string, UserEntityRecord | null>;
  }
}

export {};
