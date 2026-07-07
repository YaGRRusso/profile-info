import { BadRequestException } from "@nestjs/common";
import mongoose from "mongoose";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { toObjectId } from "@/core/mappers/base.mapper";
import {
  toDocumentForCreate,
  toDocumentForUpdate,
  toQueryForAggregate,
  toQueryForMutate,
  toQueryForRead,
} from "./catalog-scope.helper";

describe("toQueryForRead", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { userId, crossCatalog: false };

  it("should restrict to global rows and own local rows", () => {
    expect(toQueryForRead(catalog)).toEqual({
      $or: [
        { partition: CatalogPartition.GLOBAL },
        { partition: CatalogPartition.LOCAL, ownerId: userId },
      ],
    });
  });

  it("should merge extra filters for regular users", () => {
    expect(toQueryForRead(catalog, { slug: "typescript" })).toEqual({
      slug: "typescript",
      $or: [
        { partition: CatalogPartition.GLOBAL },
        { partition: CatalogPartition.LOCAL, ownerId: userId },
      ],
    });
  });

  it("should not add catalog visibility for cross-catalog access", () => {
    expect(
      toQueryForRead({ userId, crossCatalog: true }, { slug: "typescript" })
    ).toEqual({ slug: "typescript" });
  });

  it("should return an empty filter for cross-catalog access without extras", () => {
    expect(toQueryForRead({ userId, crossCatalog: true })).toEqual({});
  });
});

describe("toQueryForMutate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { userId, crossCatalog: false };

  it("should restrict updates and deletes to own LOCAL rows", () => {
    expect(toQueryForMutate(catalog, { slug: "x" })).toEqual({
      slug: "x",
      partition: CatalogPartition.LOCAL,
      ownerId: userId,
    });
  });

  it("should restrict super-admin mutations to GLOBAL rows", () => {
    expect(
      toQueryForMutate({ userId, crossCatalog: true }, { slug: "shared" })
    ).toEqual({
      slug: "shared",
      partition: CatalogPartition.GLOBAL,
    });
  });
});

describe("toQueryForAggregate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { userId, crossCatalog: false };

  it("should use ObjectId ownerId for own local rows", () => {
    expect(toQueryForAggregate(catalog)).toEqual({
      $or: [
        { partition: CatalogPartition.GLOBAL },
        {
          partition: CatalogPartition.LOCAL,
          ownerId: toObjectId(userId),
        },
      ],
    });
  });

  it("should merge extra filters for regular users", () => {
    expect(toQueryForAggregate(catalog, { disabled: false })).toEqual({
      disabled: false,
      $or: [
        { partition: CatalogPartition.GLOBAL },
        {
          partition: CatalogPartition.LOCAL,
          ownerId: toObjectId(userId),
        },
      ],
    });
  });

  it("should not add catalog visibility for cross-catalog access", () => {
    expect(
      toQueryForAggregate({ userId, crossCatalog: true }, { slug: "x" })
    ).toEqual({ slug: "x" });
  });

  it("should reject invalid userId", () => {
    expect(() =>
      toQueryForAggregate({ userId: "invalid", crossCatalog: false })
    ).toThrow(BadRequestException);
  });
});

describe("toDocumentForCreate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { userId, crossCatalog: false };

  it("should create LOCAL rows owned by the caller", () => {
    expect(
      toDocumentForCreate(catalog, {
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
      toDocumentForCreate(
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

describe("toDocumentForUpdate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { userId, crossCatalog: false };

  it("should strip partition and ownerId from top-level update fields", () => {
    expect(
      toDocumentForUpdate(catalog, {
        slug: "renamed",
        partition: CatalogPartition.GLOBAL,
        ownerId: "other",
      })
    ).toEqual({ slug: "renamed" });
  });

  it("should strip partition and ownerId from $set", () => {
    expect(
      toDocumentForUpdate(catalog, {
        $set: {
          slug: "renamed",
          partition: CatalogPartition.GLOBAL,
          ownerId: "other",
        },
      })
    ).toEqual({ $set: { slug: "renamed" } });
  });
});
