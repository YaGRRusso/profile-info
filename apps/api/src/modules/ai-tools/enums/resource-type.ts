import { registerEnumType } from "@nestjs/graphql";

export enum ResourceType {
  PROJECT = "project",
  COURSE = "course",
  EXPERIENCE = "experience",
  EDUCATION = "education",
  ORGANIZATION = "organization",
  USER = "user",
}

registerEnumType(ResourceType, {
  name: "ResourceType",
});
