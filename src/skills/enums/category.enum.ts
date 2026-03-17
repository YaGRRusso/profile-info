import { registerEnumType } from "@nestjs/graphql";

export enum SkillCategory {
  HARD = "HARD",
  SOFT = "SOFT",
}

registerEnumType(SkillCategory, {
  name: "SkillCategory",
});
