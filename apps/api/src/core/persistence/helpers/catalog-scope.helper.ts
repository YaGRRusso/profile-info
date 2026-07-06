import mongoose, { type QueryFilter } from "mongoose";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import type { CatalogScope } from "../types/scope.type";

/** Mongoose queries cast string ownerId; use for find/countDocuments. */
export function withCatalogScope<T>(
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

export function withCatalogScopeForMutate<T extends object>(
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

export function withCatalogScopeForAggregate<T>(
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
