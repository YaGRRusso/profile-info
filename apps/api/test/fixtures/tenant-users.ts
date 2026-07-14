import { DEV_PASSWORD } from "@seed/constants";
import { PERSONAS, type PersonaKey } from "@seed/personas";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
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
  await Promise.all(
    keys.map(async (key) => {
      const persona = PERSONAS[key];
      await usersService.createOne(testSuperAdminContext(), {
        email: persona.email,
        name: persona.name,
        nickname: persona.nickname,
        password: DEV_PASSWORD,
        role: persona.role ?? UserRole.USER,
      });
    })
  );
}

export { DEFAULT_TENANT_KEYS };
