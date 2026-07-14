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
  const catalog = { crossCatalog: false, userId };

  it("should restrict to global rows and own local rows", () => {
    expect(toQueryForRead(catalog)).toEqual({
      $or: [
        { partition: CatalogPartition.GLOBAL },
        { ownerId: userId, partition: CatalogPartition.LOCAL },
      ],
    });
  });

  it("should use string ownerId on read and ObjectId ownerId on aggregate for USER scope", () => {
    const read = toQueryForRead(catalog);
    const aggregate = toQueryForAggregate(catalog);

    const localReadBranch = read.$or?.[1] as { ownerId: unknown };
    const localAggregateBranch = aggregate.$or?.[1] as { ownerId: unknown };

    expect(localReadBranch.ownerId).toBe(userId);
    expect(localAggregateBranch.ownerId).toEqual(toObjectId(userId));
    expect(localReadBranch.ownerId).not.toEqual(localAggregateBranch.ownerId);
  });

  it("should merge extra filters for regular users", () => {
    expect(toQueryForRead(catalog, { slug: "typescript" })).toEqual({
      $or: [
        { partition: CatalogPartition.GLOBAL },
        { ownerId: userId, partition: CatalogPartition.LOCAL },
      ],
      slug: "typescript",
    });
  });

  it("should not add catalog visibility for cross-catalog access", () => {
    expect(
      toQueryForRead({ crossCatalog: true, userId }, { slug: "typescript" })
    ).toEqual({ slug: "typescript" });
  });

  it("should return an empty filter for cross-catalog access without extras", () => {
    expect(toQueryForRead({ crossCatalog: true, userId })).toEqual({});
  });
});

describe("toQueryForMutate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { crossCatalog: false, userId };

  it("should restrict updates and deletes to own LOCAL rows", () => {
    expect(toQueryForMutate(catalog, { slug: "x" })).toEqual({
      ownerId: userId,
      partition: CatalogPartition.LOCAL,
      slug: "x",
    });
  });

  it("should restrict super-admin mutations to GLOBAL rows", () => {
    expect(
      toQueryForMutate({ crossCatalog: true, userId }, { slug: "shared" })
    ).toEqual({
      partition: CatalogPartition.GLOBAL,
      slug: "shared",
    });
  });
});

describe("toQueryForAggregate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { crossCatalog: false, userId };

  it("should use ObjectId ownerId for own local rows", () => {
    expect(toQueryForAggregate(catalog)).toEqual({
      $or: [
        { partition: CatalogPartition.GLOBAL },
        {
          ownerId: toObjectId(userId),
          partition: CatalogPartition.LOCAL,
        },
      ],
    });
  });

  it("should merge extra filters for regular users", () => {
    expect(toQueryForAggregate(catalog, { disabled: false })).toEqual({
      $or: [
        { partition: CatalogPartition.GLOBAL },
        {
          ownerId: toObjectId(userId),
          partition: CatalogPartition.LOCAL,
        },
      ],
      disabled: false,
    });
  });

  it("should not add catalog visibility for cross-catalog access", () => {
    expect(
      toQueryForAggregate({ crossCatalog: true, userId }, { slug: "x" })
    ).toEqual({ slug: "x" });
  });

  it("should reject invalid userId", () => {
    expect(() =>
      toQueryForAggregate({ crossCatalog: false, userId: "invalid" })
    ).toThrow(BadRequestException);
  });
});

describe("toDocumentForCreate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { crossCatalog: false, userId };

  it("should create LOCAL rows owned by the caller", () => {
    expect(
      toDocumentForCreate(catalog, {
        ownerId: "ignored",
        partition: CatalogPartition.GLOBAL,
        slug: "my-skill",
      })
    ).toEqual({
      ownerId: userId,
      partition: CatalogPartition.LOCAL,
      slug: "my-skill",
    });
  });

  it("should create GLOBAL rows for cross-catalog callers", () => {
    expect(
      toDocumentForCreate(
        { crossCatalog: true, userId },
        {
          ownerId: "ignored",
          partition: CatalogPartition.LOCAL,
          slug: "shared-skill",
        }
      )
    ).toEqual({
      ownerId: userId,
      partition: CatalogPartition.GLOBAL,
      slug: "shared-skill",
    });
  });
});

describe("toDocumentForUpdate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const catalog = { crossCatalog: false, userId };

  it("should strip partition and ownerId from top-level update fields", () => {
    expect(
      toDocumentForUpdate(catalog, {
        ownerId: "other",
        partition: CatalogPartition.GLOBAL,
        slug: "renamed",
      })
    ).toEqual({ slug: "renamed" });
  });

  it("should strip partition and ownerId from $set", () => {
    expect(
      toDocumentForUpdate(catalog, {
        $set: {
          ownerId: "other",
          partition: CatalogPartition.GLOBAL,
          slug: "renamed",
        },
      })
    ).toEqual({ $set: { slug: "renamed" } });
  });
});
