import type { PersistenceScope, TenantScope } from "../types/scope.type";
import { tenantScope } from "./tenant-scope.helper";

export function isPersistenceScope(
  scope: PersistenceScope | TenantScope
): scope is PersistenceScope {
  const hasQuery =
    "query" in scope && typeof scope.query === "object" && scope.query !== null;
  const hasDocument =
    "document" in scope &&
    typeof scope.document === "object" &&
    scope.document !== null;

  return hasQuery && hasDocument;
}

export function resolvePersistenceScope(
  scope: PersistenceScope | TenantScope
): PersistenceScope {
  return isPersistenceScope(scope) ? scope : tenantScope(scope);
}

export function noopScope(): PersistenceScope {
  return {
    query: {
      forRead: (filter) => filter,
      forMutate: (filter) => filter,
      forAggregate: (filter) => filter,
    },
    document: {
      forCreate: (payload) => payload,
      forUpdate: (payload) => payload,
    },
  };
}
