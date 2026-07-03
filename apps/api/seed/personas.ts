import { UserRole } from "@/core/enums/user-role.enum";

export type PersonaKey = "empty" | "lite" | "joao" | "maria" | "full" | "admin";

export interface PersonaEntityCounts {
  courses: number;
  educations: number;
  experiences: number;
  projects: number;
}

export interface PersonaDefinition {
  email: string;
  entities: PersonaEntityCounts;
  key: PersonaKey;
  name: string;
  nickname: string;
  /** Ordered profile skill count (0 = omit skillIds). */
  profileSkillCount: number;
  role: UserRole;
}

export const PERSONAS: Record<PersonaKey, PersonaDefinition> = {
  empty: {
    key: "empty",
    email: "empty@profile.info",
    name: "E",
    nickname: "empty",
    role: UserRole.USER,
    entities: { courses: 0, educations: 0, experiences: 0, projects: 0 },
    profileSkillCount: 0,
  },
  lite: {
    key: "lite",
    email: "lite@profile.info",
    name: "Lite",
    nickname: "lite",
    role: UserRole.USER,
    entities: { courses: 1, educations: 1, experiences: 1, projects: 1 },
    profileSkillCount: 4,
  },
  joao: {
    key: "joao",
    email: "joao@profile.info",
    name: "João",
    nickname: "joao",
    role: UserRole.USER,
    entities: { courses: 4, educations: 2, experiences: 2, projects: 3 },
    profileSkillCount: 10,
  },
  maria: {
    key: "maria",
    email: "maria@profile.info",
    name: "Maria",
    nickname: "maria",
    role: UserRole.USER,
    entities: { courses: 4, educations: 2, experiences: 2, projects: 3 },
    profileSkillCount: 10,
  },
  full: {
    key: "full",
    email: "full@profile.info",
    name: "Dr. Prof. Eng. Arquiteto de Software Sênior Especialista em Plataformas Distribuídas e Liderança Técnica",
    nickname: "full",
    role: UserRole.USER,
    entities: { courses: 20, educations: 5, experiences: 5, projects: 10 },
    profileSkillCount: 24,
  },
  admin: {
    key: "admin",
    email: "admin@profile.info",
    name: "Admin",
    nickname: "admin",
    role: UserRole.SUPER_ADMIN,
    entities: { courses: 0, educations: 0, experiences: 0, projects: 0 },
    profileSkillCount: 0,
  },
};

export const PERSONA_KEYS = Object.keys(PERSONAS) as PersonaKey[];
