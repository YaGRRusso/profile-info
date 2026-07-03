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

export const SEED_API_TOKENS = [
  {
    id: "674a00000000000000000001",
    owner: "joao" as const,
    name: "João dev (query)",
    permissions: [ApiTokenPermission.QUERY],
    secret: "joao-query-dev-secret-32-chars!!",
  },
  {
    id: "674a00000000000000000002",
    owner: "joao" as const,
    name: "João dev (mutate)",
    permissions: [ApiTokenPermission.MUTATE],
    secret: "joao-mutate-dev-secret-32-chars!!",
  },
  {
    id: "674a00000000000000000003",
    owner: "maria" as const,
    name: "Maria dev (query + mutate)",
    permissions: [ApiTokenPermission.QUERY, ApiTokenPermission.MUTATE],
    secret: "maria-combined-dev-secret-32-chars!!",
  },
] as const;
