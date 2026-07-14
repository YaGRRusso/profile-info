import mongoose from "mongoose";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import type { CreateApiTokenInput } from "../dto/create-api-token.input";
import type { ApiTokenModel } from "../schemas/api-token.schema";
import { ApiTokenMapper } from "./api-token.mapper";

describe("ApiTokenMapper", () => {
  const mapper = new ApiTokenMapper();
  const ownerId = "507f1f77bcf86cd799439012";

  it("maps persistence fields to the domain entity", () => {
    const model = {
      createdAt: new Date("2024-01-01"),
      expiresAt: new Date("2025-01-01"),
      hashedSecret: "hashed",
      id: "507f1f77bcf86cd799439011",
      name: "CI token",
      ownerId,
      permissions: [ApiTokenPermission.QUERY],
      updatedAt: new Date("2024-01-02"),
    } as ApiTokenModel;

    expect(mapper.toDomain(model)).toEqual({
      createdAt: model.createdAt,
      expiresAt: model.expiresAt,
      id: "507f1f77bcf86cd799439011",
      name: "CI token",
      ownerId,
      permissions: [ApiTokenPermission.QUERY],
      updatedAt: model.updatedAt,
    });
  });

  it("maps create persistence input to a mongoose payload", () => {
    const expiresAt = new Date("2025-01-01");

    expect(
      mapper.toPersistenceForCreate({
        expiresAt,
        hashedSecret: "hashed",
        id: "507f1f77bcf86cd799439011",
        name: "CI token",
        permissions: [ApiTokenPermission.QUERY],
      } as CreateApiTokenInput & { id: string; hashedSecret: string })
    ).toEqual({
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
      expiresAt,
      hashedSecret: "hashed",
      name: "CI token",
      permissions: [ApiTokenPermission.QUERY],
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
