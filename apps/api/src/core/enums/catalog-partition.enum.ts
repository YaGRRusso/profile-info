import { registerEnumType } from "@nestjs/graphql";

export enum CatalogPartition {
  GLOBAL = "GLOBAL",
  LOCAL = "LOCAL",
}

registerEnumType(CatalogPartition, {
  name: "CatalogPartition",
});
