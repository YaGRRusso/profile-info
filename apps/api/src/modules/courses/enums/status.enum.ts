import { registerEnumType } from "@nestjs/graphql";

export enum CourseStatus {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
  IN_PROGRESS = "IN_PROGRESS",
}

registerEnumType(CourseStatus, {
  name: "CourseStatus",
});
