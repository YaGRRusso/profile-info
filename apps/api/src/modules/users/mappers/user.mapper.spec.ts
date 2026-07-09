import { UserRole } from "@/core/enums/user-role.enum";
import type { UserModel } from "../schemas/user.schema";
import { UserMapper } from "./user.mapper";

describe("UserMapper", () => {
  const mapper = new UserMapper();

  it("maps persistence fields to the domain entity", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      password: "secret",
      role: UserRole.USER,
      urls: [{ title: "GitHub", value: "https://github.com/alice" }],
    } as UserModel;

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      role: UserRole.USER,
      avatar: undefined,
      phone: undefined,
      birth: undefined,
      address: undefined,
      i18n: undefined,
      urls: [{ title: "GitHub", value: "https://github.com/alice" }],
      skillIds: undefined,
    });
  });

  it("maps skillIds to string ids on the domain entity", () => {
    const skillId = "507f1f77bcf86cd799439014";
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      password: "secret",
      role: UserRole.USER,
      skillIds: [skillId],
    } as UserModel;

    expect(mapper.toDomain(model).skillIds).toEqual([skillId]);
  });

  it("maps create input with skillIds to a persistence payload", () => {
    const skillId = "507f1f77bcf86cd799439014";

    expect(
      mapper.toPersistenceForCreate({
        name: "Alice",
        nickname: "alice",
        email: "alice@profile.info",
        password: "hashed",
        role: UserRole.USER,
        skillIds: [skillId],
      })
    ).toMatchObject({
      skillIds: [expect.any(Object)],
    });
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        name: "Alice",
        nickname: "alice",
        email: "alice@profile.info",
        password: "hashed",
        role: UserRole.USER,
      })
    ).toEqual({
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      password: "hashed",
      role: UserRole.USER,
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({ email: "alice@profile.info" })
    ).toEqual({ email: "alice@profile.info" });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ name: 1 })).toEqual({ name: 1 });
  });
});
