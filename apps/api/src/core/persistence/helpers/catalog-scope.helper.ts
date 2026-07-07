import mongoose, {
  type AnyKeys,
  type QueryFilter,
  type UpdateQuery,
} from "mongoose";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import type { CatalogScope, PersistenceScope } from "../types/scope.type";

export function toQueryForRead<T>(
  scope: CatalogScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossCatalog) {
    return (filter ?? {}) as QueryFilter<T>;
  }

  return {
    ...(filter ?? {}),
    $or: [
      { partition: CatalogPartition.GLOBAL },
      { partition: CatalogPartition.LOCAL, ownerId: scope.userId },
    ],
  } as QueryFilter<T>;
}

export function toQueryForMutate<T>(
  scope: CatalogScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossCatalog) {
    return {
      ...(filter ?? {}),
      partition: CatalogPartition.GLOBAL,
    } as QueryFilter<T>;
  }

  return {
    ...(filter ?? {}),
    partition: CatalogPartition.LOCAL,
    ownerId: scope.userId,
  } as QueryFilter<T>;
}

export function toQueryForAggregate<T>(
  scope: CatalogScope,
  filter?: QueryFilter<T>
): QueryFilter<T> {
  if (scope.crossCatalog) {
    return (filter ?? {}) as QueryFilter<T>;
  }

  return {
    ...(filter ?? {}),
    $or: [
      { partition: CatalogPartition.GLOBAL },
      {
        partition: CatalogPartition.LOCAL,
        ownerId: new mongoose.Types.ObjectId(scope.userId),
      },
    ],
  } as QueryFilter<T>;
}

export function toDocumentForCreate<T extends object>(
  scope: CatalogScope,
  input: T
): Omit<T, "partition" | "ownerId"> & {
  partition: CatalogPartition;
  ownerId: string;
} {
  const {
    partition: _,
    ownerId: __,
    ...rest
  } = input as T & {
    partition?: CatalogPartition;
    ownerId?: string;
  };

  return {
    ...rest,
    partition: scope.crossCatalog
      ? CatalogPartition.GLOBAL
      : CatalogPartition.LOCAL,
    ownerId: scope.userId,
  };
}

const immutableUpdateFields = ["partition", "ownerId"] as const;

export function toDocumentForUpdate<T>(
  _scope: CatalogScope,
  payload: UpdateQuery<T>
): UpdateQuery<T> {
  if (!payload || typeof payload !== "object") return payload;

  const strip = (value: Record<string, unknown>) => {
    const next = { ...value };
    for (const field of immutableUpdateFields) delete next[field];
    return next;
  };

  const result = { ...payload } as Record<string, unknown>;
  const set = result.$set;

  if (set && typeof set === "object" && !Array.isArray(set)) {
    result.$set = strip(set as Record<string, unknown>);
  }

  for (const field of immutableUpdateFields) {
    delete result[field];
  }

  return result as UpdateQuery<T>;
}

export function catalogScope(scope: CatalogScope): PersistenceScope {
  return {
    query: {
      forRead: (filter) => toQueryForRead(scope, filter),
      forMutate: (filter) => toQueryForMutate(scope, filter),
      forAggregate: (filter) => toQueryForAggregate(scope, filter),
    },
    document: {
      forCreate: (payload) =>
        toDocumentForCreate(scope, payload as AnyKeys<unknown>),
      forUpdate: (payload) => toDocumentForUpdate(scope, payload),
    },
  };
}
