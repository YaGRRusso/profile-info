import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { PUBLIC_KEY } from "@/core/decorators/public-route.decorator";
import { ROLES_KEY } from "@/core/decorators/roles.decorator";
import { UserRole } from "@/core/enums/user-role.enum";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new RolesGuard(reflector);

  function createContext(user?: { role?: UserRole }) {
    const req = { user };

    return {
      getType: () => "graphql",
      getHandler: () => ({}),
      getClass: () => ({}),
      getContext: () => ({ req }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(GqlExecutionContext, "create").mockImplementation(
      (context: ExecutionContext) =>
        ({
          getContext: () =>
            (context as unknown as { getContext: () => unknown }).getContext(),
        }) as GqlExecutionContext
    );
  });

  it("should allow public routes without checking roles", () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === PUBLIC_KEY) return true;
      return;
    });

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it("should allow authenticated users when no roles are required", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    expect(guard.canActivate(createContext({ role: UserRole.USER }))).toBe(
      true
    );
  });

  it("should allow admin users when ADMIN role is required", () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === ROLES_KEY) return [UserRole.ADMIN];
      return;
    });

    expect(guard.canActivate(createContext({ role: UserRole.ADMIN }))).toBe(
      true
    );
  });

  it("should forbid non-admin users when ADMIN role is required", () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === ROLES_KEY) return [UserRole.ADMIN];
      return;
    });

    expect(() =>
      guard.canActivate(createContext({ role: UserRole.USER }))
    ).toThrow(ForbiddenException);
  });
});
