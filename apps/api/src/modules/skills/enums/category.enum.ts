import { registerEnumType } from "@nestjs/graphql";

export enum SkillCategory {
  LANGUAGE = "LANGUAGE",
  FRONTEND = "FRONTEND",
  BACKEND = "BACKEND",
  DATA = "DATA",
  DEVOPS = "DEVOPS",
}

registerEnumType(SkillCategory, {
  name: "SkillCategory",
});
