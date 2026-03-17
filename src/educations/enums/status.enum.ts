import { registerEnumType } from "@nestjs/graphql";

export enum EducationStatus {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
  IN_PROGRESS = "IN_PROGRESS",
}

registerEnumType(EducationStatus, {
  name: "EducationStatus",
});
