import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@/core/enums/user-role.enum";

export const ROLES_KEY = "requiredRoles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
