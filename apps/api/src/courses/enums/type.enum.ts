import { registerEnumType } from "@nestjs/graphql";

export enum CourseType {
  BOOTCAMP = "BOOTCAMP",
  ONLINE = "ONLINE",
  CERTIFICATE = "CERTIFICATE",
  WORKSHOP = "WORKSHOP",
}

registerEnumType(CourseType, {
  name: "CourseType",
});
