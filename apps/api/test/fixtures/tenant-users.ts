import { DEV_PASSWORD } from "@seed/constants";
import { PERSONAS, type PersonaKey } from "@seed/personas";
import { UserRole } from "@/core/enums/user-role.enum";
import { UsersService } from "@/modules/users/users.service";

const DEFAULT_TENANT_KEYS = [
  "joao",
  "maria",
  "admin",
] as const satisfies PersonaKey[];

export async function createTenantUsers(
  usersService: UsersService,
  keys: readonly PersonaKey[] = DEFAULT_TENANT_KEYS
) {
  for (const key of keys) {
    const persona = PERSONAS[key];
    await usersService.createOne({
      name: persona.name,
      nickname: persona.nickname,
      email: persona.email,
      password: DEV_PASSWORD,
      role: persona.role ?? UserRole.USER,
    });
  }
}

export { DEFAULT_TENANT_KEYS };
