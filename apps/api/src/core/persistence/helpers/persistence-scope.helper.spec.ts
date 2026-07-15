import { assertDefined } from "@test/support/assert-defined";
import mongoose from "mongoose";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import {
  catalogScope,
  toQueryForAggregate as catalogToQueryForAggregate,
  toQueryForMutate as catalogToQueryForMutate,
  toQueryForRead as catalogToQueryForRead,
} from "./catalog-scope.helper";
import { noopScope } from "./persistence-scope.helper";
import {
  tenantScope,
  toQueryForAggregate as tenantToQueryForAggregate,
  toQueryForMutate as tenantToQueryForMutate,
  toQueryForRead as tenantToQueryForRead,
} from "./tenant-scope.helper";

describe("noopScope", () => {
  const scope = noopScope();

  it("should return filters unchanged on query.forRead", () => {
    expect(scope.query.forRead({ status: "COMPLETE" })).toEqual({
      status: "COMPLETE",
    });
  });

  it("should return filters unchanged on query.forMutate", () => {
    expect(scope.query.forMutate({ status: "COMPLETE" })).toEqual({
      status: "COMPLETE",
    });
  });

  it("should return filters unchanged on query.forAggregate", () => {
    const { forAggregate } = scope.query;
    assertDefined(forAggregate);
    expect(forAggregate({ slug: "x" })).toEqual({ slug: "x" });
  });

  it("should return payloads unchanged on document.forCreate", () => {
    expect(scope.document.forCreate({ name: "Test" })).toEqual({
      name: "Test",
    });
  });

  it("should return update payloads unchanged on document.forUpdate", () => {
    expect(scope.document.forUpdate({ $set: { name: "Test" } })).toEqual({
      $set: { name: "Test" },
    });
  });
});

describe("tenantScope", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { crossTenant: false, userId };
  const scope = tenantScope(tenant);

  it("should delegate query.forRead to toQueryForRead", () => {
    const filter = { status: "COMPLETE" };
    expect(scope.query.forRead(filter)).toEqual(
      tenantToQueryForRead(tenant, filter)
    );
  });

  it("should bypass ownerId on query.forRead for cross-tenant access", () => {
    const crossScope = tenantScope({ crossTenant: true, userId });
    expect(crossScope.query.forRead({ status: "COMPLETE" })).toEqual({
      status: "COMPLETE",
    });
  });

  it("should delegate query.forMutate to toQueryForMutate", () => {
    const filter = { _id: "abc" };
    expect(scope.query.forMutate(filter)).toEqual(
      tenantToQueryForMutate(tenant, filter)
    );
  });

  it("should delegate query.forAggregate to toQueryForAggregate", () => {
    const filter = { status: "COMPLETE" };
    const { forAggregate } = scope.query;
    assertDefined(forAggregate);
    expect(forAggregate(filter)).toEqual(
      tenantToQueryForAggregate(tenant, filter)
    );
  });

  it("should inject ownerId on document.forCreate and ignore input ownerId", () => {
    expect(
      scope.document.forCreate({ name: "Test", ownerId: "other" } as never)
    ).toEqual({
      name: "Test",
      ownerId: userId,
    });
  });

  it("should leave document.forUpdate unchanged", () => {
    expect(scope.document.forUpdate({ $set: { name: "Test" } })).toEqual({
      $set: { name: "Test" },
    });
  });
});

describe("catalogScope", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { crossCatalog: false, userId };
  const scope = catalogScope(catalog);

  it("should delegate query.forRead to toQueryForRead", () => {
    const filter = { slug: "typescript" };
    expect(scope.query.forRead(filter)).toEqual(
      catalogToQueryForRead(catalog, filter)
    );
  });

  it("should delegate query.forMutate to toQueryForMutate", () => {
    const filter = { slug: "typescript" };
    expect(scope.query.forMutate(filter)).toEqual(
      catalogToQueryForMutate(catalog, filter)
    );
  });

  it("should delegate query.forAggregate to toQueryForAggregate", () => {
    const filter = { disabled: false };
    const { forAggregate } = scope.query;
    assertDefined(forAggregate);
    expect(forAggregate(filter)).toEqual(
      catalogToQueryForAggregate(catalog, filter)
    );
  });

  it("should set LOCAL partition and ownerId on document.forCreate", () => {
    expect(
      scope.document.forCreate({
        ownerId: "ignored",
        partition: CatalogPartition.GLOBAL,
        slug: "my-skill",
      } as never)
    ).toEqual({
      ownerId: userId,
      partition: CatalogPartition.LOCAL,
      slug: "my-skill",
    });
  });

  it("should strip immutable fields on document.forUpdate", () => {
    expect(
      scope.document.forUpdate({
        $set: { partition: CatalogPartition.GLOBAL, slug: "renamed" },
      })
    ).toEqual({ $set: { slug: "renamed" } });
  });
});
