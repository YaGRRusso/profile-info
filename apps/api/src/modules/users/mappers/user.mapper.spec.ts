import { UserRole } from "@/core/enums/user-role.enum";
import type { UserModel } from "../schemas/user.schema";
import { UserMapper, type UserUpdateRecord } from "./user.mapper";

describe("UserMapper", () => {
  const mapper = new UserMapper();

  it("maps persistence fields to the domain entity", () => {
    const model = {
      createdAt: new Date("2024-01-01"),
      email: "alice@profile.info",
      id: "507f1f77bcf86cd799439011",
      name: "Alice",
      nickname: "alice",
      password: "secret",
      role: UserRole.USER,
      updatedAt: new Date("2024-01-02"),
      urls: [{ title: "GitHub", value: "https://github.com/alice" }],
    } as UserModel;

    expect(mapper.toDomain(model)).toEqual({
      address: undefined,
      avatar: undefined,
      birth: undefined,
      createdAt: model.createdAt,
      disabled: false,
      email: "alice@profile.info",
      i18n: undefined,
      id: "507f1f77bcf86cd799439011",
      name: "Alice",
      nickname: "alice",
      phone: undefined,
      role: UserRole.USER,
      skillIds: undefined,
      updatedAt: model.updatedAt,
      urls: [{ title: "GitHub", value: "https://github.com/alice" }],
    });
  });

  it("maps skillIds to string ids on the domain entity", () => {
    const skillId = "507f1f77bcf86cd799439014";
    const model = {
      createdAt: new Date("2024-01-01"),
      email: "alice@profile.info",
      id: "507f1f77bcf86cd799439011",
      name: "Alice",
      nickname: "alice",
      password: "secret",
      role: UserRole.USER,
      skillIds: [skillId],
      updatedAt: new Date("2024-01-02"),
    } as UserModel;

    expect(mapper.toDomain(model).skillIds).toEqual([skillId]);
  });

  it("maps create input with skillIds to a persistence payload", () => {
    const skillId = "507f1f77bcf86cd799439014";

    expect(
      mapper.toPersistenceForCreate({
        email: "alice@profile.info",
        name: "Alice",
        nickname: "alice",
        password: "hashed",
        role: UserRole.USER,
        skillIds: [skillId],
      })
    ).toMatchObject({
      skillIds: [expect.any(Object)],
    });
  });

  it("maps update input with skillIds null to clear the field", () => {
    expect(
      mapper.toPersistenceForUpdate({ skillIds: null } as UserUpdateRecord)
    ).toMatchObject({ skillIds: null });
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        email: "alice@profile.info",
        name: "Alice",
        nickname: "alice",
        password: "hashed",
        role: UserRole.USER,
      })
    ).toEqual({
      email: "alice@profile.info",
      name: "Alice",
      nickname: "alice",
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
