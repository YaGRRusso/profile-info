import type { AnyFieldMeta } from "@tanstack/react-form";

function errorMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return;

  const { message, code } = error as { code?: unknown; message?: unknown };
  if (typeof message === "string") return message;
  if (typeof code === "string") return code;
}

export function fieldError(meta: AnyFieldMeta): string | undefined {
  if (!meta.isTouched || !meta.errors.length) return;

  return (
    meta.errors
      .map((error) => errorMessage(error))
      .filter(Boolean)
      .join(", ") || undefined
  );
}
