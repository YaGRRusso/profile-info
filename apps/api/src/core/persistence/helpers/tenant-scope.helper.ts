import mongoose, {
  type AnyKeys,
  type QueryFilter,
  type UpdateQuery,
} from "mongoose";
import type { PersistenceScope, TenantScope } from "../types/scope.type";

export function toQueryForRead<T>(
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

export function toQueryForMutate<T>(
  scope: TenantScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  return toQueryForRead(scope, filter);
}

export function toQueryForAggregate<T>(
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

export function toDocumentForCreate<T>(
  scope: TenantScope,
  payload: AnyKeys<T>
): AnyKeys<T> {
  const { ownerId: _, ...rest } = payload as AnyKeys<T> & { ownerId?: string };
  return { ...rest, ownerId: scope.userId } as AnyKeys<T>;
}

export function toDocumentForUpdate<T>(
  _scope: TenantScope,
  payload: UpdateQuery<T>
): UpdateQuery<T> {
  return payload;
}

export function tenantScope(scope: TenantScope): PersistenceScope {
  return {
    query: {
      forRead: (filter) => toQueryForRead(scope, filter),
      forMutate: (filter) => toQueryForMutate(scope, filter),
      forAggregate: (filter) => toQueryForAggregate(scope, filter),
    },
    document: {
      forCreate: (payload) => toDocumentForCreate(scope, payload),
      forUpdate: (payload) => toDocumentForUpdate(scope, payload),
    },
  };
}
