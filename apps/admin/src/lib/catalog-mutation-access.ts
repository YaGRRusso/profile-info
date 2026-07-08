import { CatalogPartition } from "@/generated/graphql/graphql";

export function isCatalogRowMutationReadOnly(
  partition: CatalogPartition,
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return partition === CatalogPartition.Local;
  return partition === CatalogPartition.Global;
}

export function selectionHasReadOnlyCatalogRows<
  T extends { partition: CatalogPartition },
>(rows: T[], isSuperAdmin: boolean): boolean {
  return rows.some((row) =>
    isCatalogRowMutationReadOnly(row.partition, isSuperAdmin)
  );
}
