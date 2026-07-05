export interface TenantScope {
  crossTenant: boolean;
  userId: string;
}

export interface CatalogScope {
  crossCatalog: boolean;
  userId: string;
}
