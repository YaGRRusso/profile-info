import { Locale } from "@/common/i18n/locales";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";

export const FAKER_SEED = 20_260_702;
export const DEV_PASSWORD = "123123";

export const SEED_LOCALES = [Locale.EN, Locale.PT] as const;

export const URL_TYPES = [
  "github",
  "linkedin",
  "whatsapp",
  "email",
  "phone",
  "other",
  "website",
  "repository",
  "demo",
] as const;

export const ORGANIZATION_CATEGORIES = ["COMPANY", "SCHOOL", "OTHER"] as const;
export const STATUSES = ["COMPLETE", "INCOMPLETE", "IN_PROGRESS"] as const;
export const EDUCATION_LEVELS = [
  "HIGH_SCHOOL",
  "TECHNICAL",
  "BACHELOR",
  "POSTGRAD",
  "MASTER",
  "DOCTORATE",
] as const;
export const EXPERIENCE_CATEGORIES = [
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
  "VOLUNTEER",
] as const;

export const CATALOG_SKILL_COUNT = 96;
export const CATALOG_ORGANIZATION_COUNT = 32;

/** Stable faker offsets so local catalog slugs do not collide across personas. */
export const PERSONA_CATALOG_SEED_OFFSETS = {
  admin: 5000,
  empty: 0,
  full: 4000,
  joao: 2000,
  maria: 3000,
  pending: 6000,
} as const;

/** Fixed past expiry for the expired joão token (deterministic seed QA). */
export const SEED_EXPIRED_API_TOKEN_AT = new Date("2020-01-01T00:00:00.000Z");

export const SEED_API_TOKENS = [
  {
    id: "674a00000000000000000001",
    name: "João dev (query)",
    owner: "joao" as const,
    permissions: [ApiTokenPermission.QUERY],
    secret: "joao-query-dev-secret-32-chars!!",
  },
  {
    id: "674a00000000000000000002",
    name: "João dev (mutate)",
    owner: "joao" as const,
    permissions: [ApiTokenPermission.MUTATE],
    secret: "joao-mutate-dev-secret-32-chars!!",
  },
  {
    id: "674a00000000000000000003",
    name: "Maria dev (query + mutate)",
    owner: "maria" as const,
    permissions: [ApiTokenPermission.QUERY, ApiTokenPermission.MUTATE],
    secret: "maria-combined-dev-secret-32-chars!!",
  },
  {
    id: "674a00000000000000000004",
    name: "Admin dev (query)",
    owner: "admin" as const,
    permissions: [ApiTokenPermission.QUERY],
    secret: "admin-query-dev-secret-32-chars!!",
  },
  {
    expiresAt: SEED_EXPIRED_API_TOKEN_AT,
    id: "674a00000000000000000005",
    name: "João dev (expired query)",
    owner: "joao" as const,
    permissions: [ApiTokenPermission.QUERY],
    secret: "joao-expired-dev-secret-32-chars!",
  },
] as const;
