import { testRequestContext } from "@test/fixtures/request-context";
import { UserRole } from "@/core/enums/user-role.enum";
import { toTenantScope } from "./request-context.helper";

describe("toTenantScope", () => {
  it("scopes to the caller userId for regular users", () => {
    const ctx = testRequestContext({ userId: "user-a" });

    expect(toTenantScope(ctx)).toEqual({
      userId: "user-a",
      crossTenant: false,
    });
  });

  it("allows cross-tenant access for super admins", () => {
    const ctx = testRequestContext({ role: UserRole.SUPER_ADMIN });

    expect(toTenantScope(ctx)).toEqual({
      userId: ctx.userId,
      crossTenant: true,
    });
  });
});
