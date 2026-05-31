import { registerEnumType } from "@nestjs/graphql";

export enum EducationLevel {
  HIGH_SCHOOL = "HIGH_SCHOOL",
  TECHNICAL = "TECHNICAL",
  BACHELOR = "BACHELOR",
  POSTGRAD = "POSTGRAD",
  MASTER = "MASTER",
  DOCTORATE = "DOCTORATE",
}

registerEnumType(EducationLevel, {
  name: "EducationLevel",
});
