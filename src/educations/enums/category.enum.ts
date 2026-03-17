import { registerEnumType } from "@nestjs/graphql";

export enum EducationCategory {
  COURSE = "COURSE",
  DEGREE = "DEGREE",
  OTHER = "OTHER",
}

registerEnumType(EducationCategory, {
  name: "EducationCategory",
});
