import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import type { TenantScope } from "@/core/persistence/types/scope.type";
import type {
  ApiTokenRequestContext,
  RequestContext,
  SessionRequestContext,
} from "./request-context.interface";

interface RequestContextUser {
  id: string;
  role?: UserRole;
}

export function isSuperAdmin(ctx: RequestContext): boolean {
  return ctx.role === UserRole.SUPER_ADMIN;
}

export function isSession(ctx: RequestContext): ctx is SessionRequestContext {
  return ctx.credentialKind === CredentialKind.SESSION;
}

export function isApiToken(ctx: RequestContext): ctx is ApiTokenRequestContext {
  return ctx.credentialKind === CredentialKind.API_TOKEN;
}

/** Session JWT skips API-token permission checks; role and guards decide the rest. */
export function hasPermission(
  ctx: RequestContext,
  permission: ApiTokenPermission
): boolean {
  if (isSession(ctx)) {
    return true;
  }

  return ctx.permissions.includes(permission);
}

export function toRequestContext(
  user: RequestContextUser
): SessionRequestContext {
  const role = user.role ?? UserRole.USER;

  return {
    userId: user.id,
    role,
    credentialKind: CredentialKind.SESSION,
  };
}

export function toApiTokenRequestContext(
  user: RequestContextUser,
  permissions: ApiTokenPermission[]
): ApiTokenRequestContext {
  const role = user.role ?? UserRole.USER;

  return {
    userId: user.id,
    role,
    credentialKind: CredentialKind.API_TOKEN,
    permissions,
  };
}

export function toTenantScope(ctx: RequestContext): TenantScope {
  return { userId: ctx.userId, crossTenant: isSuperAdmin(ctx) };
}
