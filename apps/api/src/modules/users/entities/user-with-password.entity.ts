import type { UserEntity } from "./user.entity";

export type UserWithPasswordEntity = UserEntity & { password: string };
