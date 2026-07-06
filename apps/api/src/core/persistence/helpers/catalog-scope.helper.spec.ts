import mongoose from "mongoose";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import {
  withCatalogScope,
  withCatalogScopeForAggregate,
  withCatalogScopeForMutate,
} from "./catalog-scope.helper";

describe("withCatalogScope", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalogScope = { userId, crossCatalog: false };

  it("should restrict to global rows and own local rows", () => {
    expect(withCatalogScope(catalogScope)).toEqual({
      $or: [
        { partition: CatalogPartition.GLOBAL },
        { partition: CatalogPartition.LOCAL, ownerId: userId },
      ],
    });
  });

  it("should merge extra filters for regular users", () => {
    expect(withCatalogScope(catalogScope, { slug: "typescript" })).toEqual({
      slug: "typescript",
      $or: [
        { partition: CatalogPartition.GLOBAL },
        { partition: CatalogPartition.LOCAL, ownerId: userId },
      ],
    });
  });

  it("should not add catalog visibility for cross-catalog access", () => {
    expect(
      withCatalogScope({ userId, crossCatalog: true }, { slug: "typescript" })
    ).toEqual({ slug: "typescript" });
  });

  it("should return an empty filter for cross-catalog access without extras", () => {
    expect(withCatalogScope({ userId, crossCatalog: true })).toEqual({});
  });
});

describe("withCatalogScopeForAggregate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalogScope = { userId, crossCatalog: false };

  it("should use ObjectId ownerId for own local rows", () => {
    expect(withCatalogScopeForAggregate(catalogScope)).toEqual({
      $or: [
        { partition: CatalogPartition.GLOBAL },
        {
          partition: CatalogPartition.LOCAL,
          ownerId: new mongoose.Types.ObjectId(userId),
        },
      ],
    });
  });

  it("should merge extra filters for regular users", () => {
    expect(
      withCatalogScopeForAggregate(catalogScope, { disabled: false })
    ).toEqual({
      disabled: false,
      $or: [
        { partition: CatalogPartition.GLOBAL },
        {
          partition: CatalogPartition.LOCAL,
          ownerId: new mongoose.Types.ObjectId(userId),
        },
      ],
    });
  });

  it("should not add catalog visibility for cross-catalog access", () => {
    expect(
      withCatalogScopeForAggregate(
        { userId, crossCatalog: true },
        { slug: "x" }
      )
    ).toEqual({ slug: "x" });
  });
});

describe("withCatalogScopeForMutate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalogScope = { userId, crossCatalog: false };

  it("should create LOCAL rows owned by the caller", () => {
    expect(
      withCatalogScopeForMutate(catalogScope, {
        slug: "my-skill",
        partition: CatalogPartition.GLOBAL,
        ownerId: "ignored",
      })
    ).toEqual({
      slug: "my-skill",
      partition: CatalogPartition.LOCAL,
      ownerId: userId,
    });
  });

  it("should create GLOBAL rows for cross-catalog callers", () => {
    expect(
      withCatalogScopeForMutate(
        { userId, crossCatalog: true },
        {
          slug: "shared-skill",
          partition: CatalogPartition.LOCAL,
          ownerId: "ignored",
        }
      )
    ).toEqual({
      slug: "shared-skill",
      partition: CatalogPartition.GLOBAL,
      ownerId: userId,
    });
  });
});
