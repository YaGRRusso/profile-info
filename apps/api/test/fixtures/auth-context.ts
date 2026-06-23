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
    userId: "507f1f77bcf86cd799439011",
    role: UserRole.USER,
    credentialKind: CredentialKind.SESSION,
    ...overrides,
  };
}

export function testApiTokenAuthContext(
  permissions: ApiTokenPermission[],
  overrides: Partial<Omit<ApiTokenAuthContext, "permissions">> = {}
): ApiTokenAuthContext {
  return {
    userId: "507f1f77bcf86cd799439011",
    role: UserRole.USER,
    credentialKind: CredentialKind.API_TOKEN,
    permissions,
    ...overrides,
  };
}
