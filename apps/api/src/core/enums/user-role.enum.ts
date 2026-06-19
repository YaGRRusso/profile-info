import { registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  USER = "USER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

registerEnumType(UserRole, {
  name: "UserRole",
});
