import { UserRole } from "@/core/enums/user-role.enum";
import type { UserModel } from "../schemas/user.schema";
import { toUserEntity } from "./user.mapper";

describe("toUserEntity", () => {
  it("maps model to entity without password", () => {
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

    expect(toUserEntity(model)).toEqual({
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
    });
  });
});
