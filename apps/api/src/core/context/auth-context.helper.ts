import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { catalogScope } from "@/core/persistence/helpers/catalog-scope.helper";
import { tenantScope } from "@/core/persistence/helpers/tenant-scope.helper";
import type {
  CatalogScope,
  PersistenceScope,
  TenantScope,
} from "@/core/persistence/types/scope.type";
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

export function hasPermission(
  ctx: AuthContext,
  permission: ApiTokenPermission
): boolean {
  if (isApiToken(ctx)) {
    return ctx.permissions.includes(permission);
  }

  return true;
}

export function toSessionAuthContext(
  user: AuthContextUser
): SessionAuthContext {
  return {
    ...user,
    credentialKind: CredentialKind.SESSION,
    role: user.role ?? UserRole.USER,
  };
}

export function toApiTokenAuthContext(
  user: AuthContextUser,
  permissions: ApiTokenPermission[]
): ApiTokenAuthContext {
  return {
    ...user,
    credentialKind: CredentialKind.API_TOKEN,
    permissions,
    role: user.role ?? UserRole.USER,
  };
}

export function toTenantScope(ctx: AuthContext): TenantScope {
  return { crossTenant: isSuperAdmin(ctx), userId: ctx.id };
}

export function toCatalogScope(ctx: AuthContext): CatalogScope {
  return { crossCatalog: isSuperAdmin(ctx), userId: ctx.id };
}

export function tenantPersistenceScope(ctx: AuthContext): PersistenceScope {
  return tenantScope(toTenantScope(ctx));
}

export function catalogPersistenceScope(ctx: AuthContext): PersistenceScope {
  return catalogScope(toCatalogScope(ctx));
}
