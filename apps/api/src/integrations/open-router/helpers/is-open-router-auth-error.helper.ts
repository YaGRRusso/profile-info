/** Auth failures cannot be recovered by trying another model (same API key). */
export function isOpenRouterAuthError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("statusCode" in error && error.statusCode === 401) {
    return true;
  }

  return "name" in error && error.name === "UnauthorizedResponseError";
}
