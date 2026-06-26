import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import type { ApiTokenModel } from "../schemas/api-token.schema";
import { ApiTokenMapper } from "./api-token.mapper";

describe("ApiTokenMapper", () => {
  const mapper = new ApiTokenMapper();
  const ownerId = "507f1f77bcf86cd799439012";

  it("maps persistence fields to the domain entity", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      ownerId,
      name: "CI token",
      hashedSecret: "hashed",
      permissions: [ApiTokenPermission.QUERY],
      expiresAt: new Date("2025-01-01"),
    } as ApiTokenModel;

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      ownerId,
      name: "CI token",
      permissions: [ApiTokenPermission.QUERY],
      expiresAt: model.expiresAt,
    });
  });

  it("maps create persistence input to a mongoose payload", () => {
    const expiresAt = new Date("2025-01-01");

    expect(
      mapper.toPersistenceForCreate({
        id: "507f1f77bcf86cd799439011",
        name: "CI token",
        hashedSecret: "hashed",
        permissions: [ApiTokenPermission.QUERY],
        expiresAt,
      })
    ).toEqual({
      _id: "507f1f77bcf86cd799439011",
      name: "CI token",
      hashedSecret: "hashed",
      permissions: [ApiTokenPermission.QUERY],
      expiresAt,
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(mapper.toPersistenceForFilter({ name: "CI token" })).toEqual({
      name: "CI token",
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ name: 1 })).toEqual({ name: 1 });
  });
});
