import { registerEnumType } from "@nestjs/graphql";

export enum SkillCategory {
  LANGUAGE = "LANGUAGE",
  FRONTEND = "FRONTEND",
  BACKEND = "BACKEND",
  DATA = "DATA",
  DEVOPS = "DEVOPS",
  QUALITY = "QUALITY",
  DESIGN = "DESIGN",
  CONCEPTS = "CONCEPTS",
  SOFT = "SOFT",
}

registerEnumType(SkillCategory, {
  name: "SkillCategory",
});
