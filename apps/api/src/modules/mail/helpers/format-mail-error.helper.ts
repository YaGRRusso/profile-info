import { HttpException } from "@nestjs/common";

export function formatMailError(error: unknown): string {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    if (typeof response === "string") return response;

    if (typeof response === "object" && response !== null) {
      const body = response as {
        args?: { detail?: unknown };
        message?: unknown;
      };
      const detail = body.args?.detail;
      if (typeof detail === "string" && detail.length > 0) {
        return detail;
      }
      if (typeof body.message === "string") return body.message;
    }

    return error.message;
  }

  if (error instanceof Error) return error.message;
  return String(error);
}
