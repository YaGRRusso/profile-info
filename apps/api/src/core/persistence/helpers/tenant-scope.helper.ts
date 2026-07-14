import { assign, omit } from "lodash";
import type { AnyKeys, QueryFilter, UpdateQuery } from "mongoose";
import { assertValidObjectId } from "@/common/helpers/object-id.helper";
import { toObjectId } from "@/core/mappers/base.mapper";
import type { PersistenceScope, TenantScope } from "../types/scope.type";

export function toQueryForRead<T>(
  scope: TenantScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossTenant) {
    return filter ?? {};
  }

  assertValidObjectId(scope.userId);
  return assign({}, filter ?? {}, { ownerId: scope.userId });
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
    return filter ?? {};
  }

  return assign({}, filter ?? {}, { ownerId: toObjectId(scope.userId) });
}

export function toDocumentForCreate<T>(
  scope: TenantScope,
  payload: AnyKeys<T> & { ownerId?: string }
): AnyKeys<T> {
  assertValidObjectId(scope.userId);
  return assign(omit(payload, ["ownerId"]), { ownerId: scope.userId });
}

export function toDocumentForUpdate<T>(
  _scope: TenantScope,
  payload: UpdateQuery<T>
): UpdateQuery<T> {
  return payload;
}

export function tenantScope(scope: TenantScope): PersistenceScope {
  return {
    document: {
      forCreate: (payload) => toDocumentForCreate(scope, payload),
      forUpdate: (payload) => toDocumentForUpdate(scope, payload),
    },
    query: {
      forAggregate: (filter) => toQueryForAggregate(scope, filter),
      forMutate: (filter) => toQueryForMutate(scope, filter),
      forRead: (filter) => toQueryForRead(scope, filter),
    },
  };
}
