import type {
  ApiTokenAuthContext,
  SessionAuthContext,
} from "@/core/context/auth-context.interface";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";

export function testAuthContext(
  overrides: Partial<SessionAuthContext> = {}
): SessionAuthContext {
  return {
    credentialKind: CredentialKind.SESSION,
    id: "507f1f77bcf86cd799439011",
    role: UserRole.USER,
    ...overrides,
  };
}

export function testSuperAdminContext(
  overrides: Partial<SessionAuthContext> = {}
): SessionAuthContext {
  return testAuthContext({ role: UserRole.SUPER_ADMIN, ...overrides });
}

export function testApiTokenAuthContext(
  permissions: ApiTokenPermission[],
  overrides: Partial<Omit<ApiTokenAuthContext, "permissions">> = {}
): ApiTokenAuthContext {
  return {
    credentialKind: CredentialKind.API_TOKEN,
    id: "507f1f77bcf86cd799439011",
    permissions,
    role: UserRole.USER,
    ...overrides,
  };
}
