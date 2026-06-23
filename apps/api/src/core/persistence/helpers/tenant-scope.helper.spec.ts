import mongoose from "mongoose";
import {
  withTenantScope,
  withTenantScopeForAggregate,
} from "./tenant-scope.helper";

describe("withTenantScope", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenantScope = { userId, crossTenant: false };

  it("should add string ownerId for tenant users", () => {
    expect(withTenantScope(tenantScope)).toEqual({ ownerId: userId });
  });

  it("should merge extra filters for tenant users", () => {
    expect(withTenantScope(tenantScope, { status: "COMPLETE" })).toEqual({
      status: "COMPLETE",
      ownerId: userId,
    });
  });

  it("should not add ownerId for cross-tenant access", () => {
    expect(
      withTenantScope({ userId, crossTenant: true }, { status: "COMPLETE" })
    ).toEqual({ status: "COMPLETE" });
  });

  it("should return an empty filter for cross-tenant access without extras", () => {
    expect(withTenantScope({ userId, crossTenant: true })).toEqual({});
  });
});

describe("withTenantScopeForAggregate", () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tenantScope = { userId, crossTenant: false };

  it("should add ObjectId ownerId for tenant users", () => {
    expect(withTenantScopeForAggregate(tenantScope)).toEqual({
      ownerId: new mongoose.Types.ObjectId(userId),
    });
  });

  it("should merge extra filters for tenant users", () => {
    expect(
      withTenantScopeForAggregate(tenantScope, { status: "COMPLETE" })
    ).toEqual({
      status: "COMPLETE",
      ownerId: new mongoose.Types.ObjectId(userId),
    });
  });

  it("should not add ownerId for cross-tenant access", () => {
    expect(
      withTenantScopeForAggregate({ userId, crossTenant: true }, { slug: "x" })
    ).toEqual({ slug: "x" });
  });
});
