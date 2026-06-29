import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import type { TenantScope } from "@/core/persistence/types/scope.type";
import type {
  ApiTokenAuthContext,
  AuthContext,
  AuthContextUser,
  SessionAuthContext,
} from "./auth-context.interface";

export function isSuperAdmin(ctx: AuthContext): boolean {
  return ctx.role === UserRole.SUPER_ADMIN;
}

export function isSession(ctx: AuthContext): ctx is SessionAuthContext {
  return ctx.credentialKind === CredentialKind.SESSION;
}

export function isApiToken(ctx: AuthContext): ctx is ApiTokenAuthContext {
  return ctx.credentialKind === CredentialKind.API_TOKEN;
}

/** Session JWT skips API-token permission checks; role and guards decide the rest. */
export function hasPermission(
  ctx: AuthContext,
  permission: ApiTokenPermission
): boolean {
  if (isSession(ctx)) {
    return true;
  }

  return ctx.permissions.includes(permission);
}

export function toSessionAuthContext(
  user: AuthContextUser
): SessionAuthContext {
  const role = user.role ?? UserRole.USER;

  return {
    userId: user.id,
    role,
    credentialKind: CredentialKind.SESSION,
  };
}

export function toApiTokenAuthContext(
  user: AuthContextUser,
  permissions: ApiTokenPermission[]
): ApiTokenAuthContext {
  const role = user.role ?? UserRole.USER;

  return {
    userId: user.id,
    role,
    credentialKind: CredentialKind.API_TOKEN,
    permissions,
  };
}

export function toTenantScope(ctx: AuthContext): TenantScope {
  return { userId: ctx.userId, crossTenant: isSuperAdmin(ctx) };
}
