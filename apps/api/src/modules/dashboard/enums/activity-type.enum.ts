import { registerEnumType } from "@nestjs/graphql";

export enum DashboardActivityType {
  SKILL = "SKILL",
  COURSE = "COURSE",
  EDUCATION = "EDUCATION",
  ORGANIZATION = "ORGANIZATION",
  PROJECT = "PROJECT",
  EXPERIENCE = "EXPERIENCE",
}

registerEnumType(DashboardActivityType, {
  name: "DashboardActivityType",
});
