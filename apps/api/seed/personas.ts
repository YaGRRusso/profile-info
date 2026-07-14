import { UserRole } from "@/core/enums/user-role.enum";

export type PersonaKey =
  | "empty"
  | "joao"
  | "maria"
  | "full"
  | "pending"
  | "admin";

/**
 * Dev personas for manual QA and e2e fixtures (`@test/fixtures/sign-in-persona`).
 *
 * Catalog: GLOBAL pool is owned by `admin`; each USER persona may add LOCAL skills/orgs.
 * The first LOCAL skill and org per persona is always `disabled: true` for picker UX.
 * `empty` / `pending` / `admin` have no LOCAL catalog rows.
 * `pending` mirrors post-register approval (`disabled: true`; sign-in rejected).
 */
export interface PersonaEntityCounts {
  courses: number;
  educations: number;
  experiences: number;
  projects: number;
}

export interface PersonaLocalCatalogCounts {
  organizations: number;
  skills: number;
}

export interface PersonaDefinition {
  /** When true, user cannot sign in (approval queue QA). Defaults to false. */
  disabled?: boolean;
  email: string;
  entities: PersonaEntityCounts;
  key: PersonaKey;
  localCatalog: PersonaLocalCatalogCounts;
  name: string;
  nickname: string;
  /** Ordered profile skill count (0 = omit skillIds). */
  profileSkillCount: number;
  role: UserRole;
}

/** Declaration order is the QA matrix order (see seed/README.md). */
export const PERSONAS: Record<PersonaKey, PersonaDefinition> = {
  admin: {
    email: "admin@profile.info",
    entities: { courses: 0, educations: 0, experiences: 0, projects: 0 },
    key: "admin",
    localCatalog: { organizations: 0, skills: 0 },
    name: "Admin",
    nickname: "admin",
    profileSkillCount: 0,
    role: UserRole.SUPER_ADMIN,
  },
  empty: {
    email: "empty@profile.info",
    entities: { courses: 0, educations: 0, experiences: 0, projects: 0 },
    key: "empty",
    localCatalog: { organizations: 0, skills: 0 },
    name: "Empty",
    nickname: "empty",
    profileSkillCount: 0,
    role: UserRole.USER,
  },
  full: {
    email: "full@profile.info",
    entities: { courses: 20, educations: 5, experiences: 5, projects: 10 },
    key: "full",
    localCatalog: { organizations: 4, skills: 8 },
    name: "Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit",
    nickname: "full",
    profileSkillCount: 24,
    role: UserRole.USER,
  },
  joao: {
    email: "joao@profile.info",
    entities: { courses: 4, educations: 2, experiences: 2, projects: 3 },
    key: "joao",
    localCatalog: { organizations: 2, skills: 4 },
    name: "João",
    nickname: "joao",
    profileSkillCount: 10,
    role: UserRole.USER,
  },
  maria: {
    email: "maria@profile.info",
    entities: { courses: 4, educations: 2, experiences: 2, projects: 3 },
    key: "maria",
    localCatalog: { organizations: 2, skills: 4 },
    name: "Maria",
    nickname: "maria",
    profileSkillCount: 10,
    role: UserRole.USER,
  },
  pending: {
    disabled: true,
    email: "pending@profile.info",
    entities: { courses: 0, educations: 0, experiences: 0, projects: 0 },
    key: "pending",
    localCatalog: { organizations: 0, skills: 0 },
    name: "Pending",
    nickname: "pending",
    profileSkillCount: 0,
    role: UserRole.USER,
  },
};

export const PERSONA_KEYS = Object.keys(PERSONAS) as PersonaKey[];
