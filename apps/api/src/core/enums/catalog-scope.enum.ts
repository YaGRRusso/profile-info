import { registerEnumType } from "@nestjs/graphql";

export enum CatalogScope {
  GLOBAL = "GLOBAL",
  LOCAL = "LOCAL",
}

registerEnumType(CatalogScope, {
  name: "CatalogScope",
});
