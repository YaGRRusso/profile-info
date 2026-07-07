import type { AnyKeys, QueryFilter, UpdateQuery } from "mongoose";

export interface PersistenceScopeQuery {
  forAggregate?<T>(filter: QueryFilter<T>): QueryFilter<T>;
  forMutate<T>(filter: QueryFilter<T>): QueryFilter<T>;
  forRead<T>(filter: QueryFilter<T>): QueryFilter<T>;
}

export interface PersistenceScopeDocument {
  forCreate<T>(payload: AnyKeys<T>): AnyKeys<T>;
  forUpdate<T>(payload: UpdateQuery<T>): UpdateQuery<T>;
}

export interface PersistenceScope {
  document: PersistenceScopeDocument;
  query: PersistenceScopeQuery;
}

export interface TenantScope {
  crossTenant: boolean;
  userId: string;
}

export interface CatalogScope {
  crossCatalog: boolean;
  userId: string;
}
