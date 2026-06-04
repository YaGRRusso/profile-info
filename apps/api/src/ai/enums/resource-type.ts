import { registerEnumType } from "@nestjs/graphql";

export enum ResourceType {
  PROJECT = "project",
  COURSE = "course",
  EXPERIENCE = "experience",
  EDUCATION = "education",
}

registerEnumType(ResourceType, {
  name: "ResourceType",
});
