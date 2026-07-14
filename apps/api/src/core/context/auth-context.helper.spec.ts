import { testAuthContext } from "@test/fixtures/auth-context";
import { UserRole } from "@/core/enums/user-role.enum";
import { toCatalogScope, toTenantScope } from "./auth-context.helper";

describe("toTenantScope", () => {
  it("scopes to the caller userId for regular users", () => {
    const ctx = testAuthContext({ id: "user-a" });

    expect(toTenantScope(ctx)).toEqual({
      crossTenant: false,
      userId: "user-a",
    });
  });

  it("allows cross-tenant access for super admins", () => {
    const ctx = testAuthContext({ role: UserRole.SUPER_ADMIN });

    expect(toTenantScope(ctx)).toEqual({
      crossTenant: true,
      userId: ctx.id,
    });
  });
});

describe("toCatalogScope", () => {
  it("scopes to the caller userId for regular users", () => {
    const ctx = testAuthContext({ id: "user-a" });

    expect(toCatalogScope(ctx)).toEqual({
      crossCatalog: false,
      userId: "user-a",
    });
  });

  it("allows cross-catalog access for super admins", () => {
    const ctx = testAuthContext({ role: UserRole.SUPER_ADMIN });

    expect(toCatalogScope(ctx)).toEqual({
      crossCatalog: true,
      userId: ctx.id,
    });
  });
});
