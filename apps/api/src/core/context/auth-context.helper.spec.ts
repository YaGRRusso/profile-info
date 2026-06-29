import { testAuthContext } from "@test/fixtures/auth-context";
import { UserRole } from "@/core/enums/user-role.enum";
import { toTenantScope } from "./auth-context.helper";

describe("toTenantScope", () => {
  it("scopes to the caller userId for regular users", () => {
    const ctx = testAuthContext({ id: "user-a" });

    expect(toTenantScope(ctx)).toEqual({
      userId: "user-a",
      crossTenant: false,
    });
  });

  it("allows cross-tenant access for super admins", () => {
    const ctx = testAuthContext({ role: UserRole.SUPER_ADMIN });

    expect(toTenantScope(ctx)).toEqual({
      userId: ctx.id,
      crossTenant: true,
    });
  });
});
