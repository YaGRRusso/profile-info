import { BadRequestException } from "@nestjs/common";
import mongoose from "mongoose";
import { toObjectId } from "@/core/mappers/base.mapper";
import {
  toDocumentForCreate,
  toDocumentForUpdate,
  toQueryForAggregate,
  toQueryForMutate,
  toQueryForRead,
} from "./tenant-scope.helper";

describe("toQueryForRead", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { crossTenant: false, userId };

  it("should add string ownerId for tenant users", () => {
    expect(toQueryForRead(tenant)).toEqual({ ownerId: userId });
  });

  it("should merge extra filters for tenant users", () => {
    expect(toQueryForRead(tenant, { status: "COMPLETE" })).toEqual({
      ownerId: userId,
      status: "COMPLETE",
    });
  });

  it("should not add ownerId for cross-tenant access", () => {
    expect(
      toQueryForRead({ crossTenant: true, userId }, { status: "COMPLETE" })
    ).toEqual({ status: "COMPLETE" });
  });

  it("should return an empty filter for cross-tenant access without extras", () => {
    expect(toQueryForRead({ crossTenant: true, userId })).toEqual({});
  });
});

describe("toQueryForMutate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { crossTenant: false, userId };

  it("should delegate to toQueryForRead", () => {
    const filter = { status: "COMPLETE" };
    expect(toQueryForMutate(tenant, filter)).toEqual(
      toQueryForRead(tenant, filter)
    );
  });
});

describe("toQueryForAggregate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { crossTenant: false, userId };

  it("should add ObjectId ownerId for tenant users", () => {
    expect(toQueryForAggregate(tenant)).toEqual({
      ownerId: toObjectId(userId),
    });
  });

  it("should merge extra filters for tenant users", () => {
    expect(toQueryForAggregate(tenant, { status: "COMPLETE" })).toEqual({
      ownerId: toObjectId(userId),
      status: "COMPLETE",
    });
  });

  it("should not add ownerId for cross-tenant access", () => {
    expect(
      toQueryForAggregate({ crossTenant: true, userId }, { slug: "x" })
    ).toEqual({ slug: "x" });
  });

  it("should reject invalid userId", () => {
    expect(() =>
      toQueryForAggregate({ crossTenant: false, userId: "invalid" })
    ).toThrow(BadRequestException);
  });
});

describe("toDocumentForCreate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { crossTenant: false, userId };

  it("should inject ownerId and ignore input ownerId", () => {
    expect(
      toDocumentForCreate(tenant, { name: "Test", ownerId: "other" })
    ).toEqual({
      name: "Test",
      ownerId: userId,
    });
  });

  it("should reject invalid userId", () => {
    expect(() =>
      toDocumentForCreate(
        { crossTenant: false, userId: "invalid" },
        { name: "Test" }
      )
    ).toThrow(BadRequestException);
  });
});

describe("toDocumentForUpdate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { crossTenant: false, userId };

  it("should return payloads unchanged", () => {
    expect(toDocumentForUpdate(tenant, { $set: { name: "Test" } })).toEqual({
      $set: { name: "Test" },
    });
  });
});
