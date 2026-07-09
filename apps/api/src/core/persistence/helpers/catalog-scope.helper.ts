import { assign, isPlainObject, omit } from "lodash";
import type { AnyKeys, QueryFilter, UpdateQuery } from "mongoose";
import { assertValidObjectId } from "@/common/helpers/object-id.helper";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { toObjectId } from "@/core/mappers/base.mapper";
import type { CatalogScope, PersistenceScope } from "../types/scope.type";

const immutableCatalogFields = ["partition", "ownerId"] as const;

export function toQueryForRead<T>(
  scope: CatalogScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossCatalog) {
    return filter ?? {};
  }

  assertValidObjectId(scope.userId);
  return assign({}, filter ?? {}, {
    $or: [
      { partition: CatalogPartition.GLOBAL },
      { partition: CatalogPartition.LOCAL, ownerId: scope.userId },
    ],
  });
}

export function toQueryForMutate<T>(
  scope: CatalogScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossCatalog) {
    return assign({}, filter ?? {}, { partition: CatalogPartition.GLOBAL });
  }

  assertValidObjectId(scope.userId);
  return assign({}, filter ?? {}, {
    partition: CatalogPartition.LOCAL,
    ownerId: scope.userId,
  });
}

export function toQueryForAggregate<T>(
  scope: CatalogScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossCatalog) {
    return filter ?? {};
  }

  return assign({}, filter ?? {}, {
    $or: [
      { partition: CatalogPartition.GLOBAL },
      {
        partition: CatalogPartition.LOCAL,
        ownerId: toObjectId(scope.userId),
      },
    ],
  });
}

export function toDocumentForCreate<T>(
  scope: CatalogScope,
  payload: AnyKeys<T> & { ownerId?: string; partition?: CatalogPartition }
): AnyKeys<T> {
  assertValidObjectId(scope.userId);
  return assign(omit(payload, immutableCatalogFields), {
    partition: scope.crossCatalog
      ? CatalogPartition.GLOBAL
      : CatalogPartition.LOCAL,
    ownerId: scope.userId,
  });
}

export function toDocumentForUpdate<T>(
  _scope: CatalogScope,
  payload: UpdateQuery<T>
): UpdateQuery<T> {
  if (!isPlainObject(payload)) {
    return payload;
  }

  const withoutTopLevel = omit(payload, immutableCatalogFields);
  const set = withoutTopLevel.$set;

  if (!isPlainObject(set)) {
    return withoutTopLevel as UpdateQuery<T>;
  }

  return {
    ...withoutTopLevel,
    $set: omit(set, immutableCatalogFields),
  } as UpdateQuery<T>;
}

export function catalogScope(scope: CatalogScope): PersistenceScope {
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
