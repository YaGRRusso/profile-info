import type {
  ApiTokenRequestContext,
  SessionRequestContext,
} from "@/core/context/request-context.interface";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";

export function testRequestContext(
  overrides: Partial<SessionRequestContext> = {}
): SessionRequestContext {
  return {
    userId: "507f1f77bcf86cd799439011",
    role: UserRole.USER,
    credentialKind: CredentialKind.SESSION,
    ...overrides,
  };
}

export function testApiTokenRequestContext(
  permissions: ApiTokenPermission[],
  overrides: Partial<Omit<ApiTokenRequestContext, "permissions">> = {}
): ApiTokenRequestContext {
  return {
    userId: "507f1f77bcf86cd799439011",
    role: UserRole.USER,
    credentialKind: CredentialKind.API_TOKEN,
    permissions,
    ...overrides,
  };
}
