import { registerEnumType } from "@nestjs/graphql";

export enum ExperienceCategory {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  FREELANCE = "FREELANCE",
  VOLUNTEER = "VOLUNTEER",
}

registerEnumType(ExperienceCategory, {
  name: "ExperienceCategory",
});
