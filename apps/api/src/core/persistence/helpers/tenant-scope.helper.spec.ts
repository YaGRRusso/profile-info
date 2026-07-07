import mongoose from "mongoose";
import {
  toDocumentForCreate,
  toDocumentForUpdate,
  toQueryForAggregate,
  toQueryForMutate,
  toQueryForRead,
} from "./tenant-scope.helper";

describe("toQueryForRead", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { userId, crossTenant: false };

  it("should add string ownerId for tenant users", () => {
    expect(toQueryForRead(tenant)).toEqual({ ownerId: userId });
  });

  it("should merge extra filters for tenant users", () => {
    expect(toQueryForRead(tenant, { status: "COMPLETE" })).toEqual({
      status: "COMPLETE",
      ownerId: userId,
    });
  });

  it("should not add ownerId for cross-tenant access", () => {
    expect(
      toQueryForRead({ userId, crossTenant: true }, { status: "COMPLETE" })
    ).toEqual({ status: "COMPLETE" });
  });

  it("should return an empty filter for cross-tenant access without extras", () => {
    expect(toQueryForRead({ userId, crossTenant: true })).toEqual({});
  });
});

describe("toQueryForMutate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { userId, crossTenant: false };

  it("should delegate to toQueryForRead", () => {
    const filter = { status: "COMPLETE" };
    expect(toQueryForMutate(tenant, filter)).toEqual(
      toQueryForRead(tenant, filter)
    );
  });
});

describe("toQueryForAggregate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { userId, crossTenant: false };

  it("should add ObjectId ownerId for tenant users", () => {
    expect(toQueryForAggregate(tenant)).toEqual({
      ownerId: new mongoose.Types.ObjectId(userId),
    });
  });

  it("should merge extra filters for tenant users", () => {
    expect(toQueryForAggregate(tenant, { status: "COMPLETE" })).toEqual({
      status: "COMPLETE",
      ownerId: new mongoose.Types.ObjectId(userId),
    });
  });

  it("should not add ownerId for cross-tenant access", () => {
    expect(
      toQueryForAggregate({ userId, crossTenant: true }, { slug: "x" })
    ).toEqual({ slug: "x" });
  });
});

describe("toDocumentForCreate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { userId, crossTenant: false };

  it("should inject ownerId and ignore input ownerId", () => {
    expect(
      toDocumentForCreate(tenant, { name: "Test", ownerId: "other" })
    ).toEqual({
      name: "Test",
      ownerId: userId,
    });
  });
});

describe("toDocumentForUpdate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { userId, crossTenant: false };

  it("should return payloads unchanged", () => {
    expect(toDocumentForUpdate(tenant, { $set: { name: "Test" } })).toEqual({
      $set: { name: "Test" },
    });
  });
});
