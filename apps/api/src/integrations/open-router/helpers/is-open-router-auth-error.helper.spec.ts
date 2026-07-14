import { isOpenRouterAuthError } from "./is-open-router-auth-error.helper";

describe("isOpenRouterAuthError", () => {
  it("returns true for status 401 errors", () => {
    expect(
      isOpenRouterAuthError(
        Object.assign(new Error("unauthorized"), { statusCode: 401 })
      )
    ).toBe(true);
  });

  it("returns true for UnauthorizedResponseError by name", () => {
    expect(
      isOpenRouterAuthError(
        Object.assign(new Error("unauthorized"), {
          name: "UnauthorizedResponseError",
        })
      )
    ).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(
      isOpenRouterAuthError(
        Object.assign(new Error("gone"), { statusCode: 404 })
      )
    ).toBe(false);
    expect(isOpenRouterAuthError(new Error("model unavailable"))).toBe(false);
    expect(isOpenRouterAuthError("string error")).toBe(false);
    expect(isOpenRouterAuthError(null)).toBe(false);
  });
});
