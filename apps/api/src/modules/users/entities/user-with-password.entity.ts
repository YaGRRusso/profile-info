import type { UserEntityRecord } from "./user.entity";

export type UserWithPasswordEntity = UserEntityRecord & { password: string };
