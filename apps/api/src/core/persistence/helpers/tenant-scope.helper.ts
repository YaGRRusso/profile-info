import mongoose, { type QueryFilter } from "mongoose";
import type { TenantScope } from "../types/scope.type";

export function withTenantScope<T>(
  scope: TenantScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossTenant) {
    return (filter ?? {}) as QueryFilter<T>;
  }

  return {
    ...(filter ?? {}),
    ownerId: scope.userId,
  } as QueryFilter<T>;
}

export function withTenantScopeForAggregate<T>(
  scope: TenantScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossTenant) {
    return (filter ?? {}) as QueryFilter<T>;
  }

  return {
    ...(filter ?? {}),
    ownerId: new mongoose.Types.ObjectId(scope.userId),
  } as QueryFilter<T>;
}
