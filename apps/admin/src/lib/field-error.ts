import type { AnyFieldMeta } from "@tanstack/react-form";
import { compact } from "lodash";
import i18n from "@/i18n";

function errorMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return;

  const { message, code } = error as { code?: unknown; message?: unknown };
  if (typeof message === "string") return message;
  if (typeof code === "string") return code;
}

function resolveError(error: unknown): string | undefined {
  const key = errorMessage(error);
  if (!key) return;

  const issue =
    error && typeof error === "object"
      ? (error as { maximum?: number; minimum?: number })
      : undefined;
  const value = issue?.minimum ?? issue?.maximum;

  return i18n.t(key, {
    ns: "validation",
    ...(value === undefined ? {} : { value }),
  });
}

export function fieldError(meta: AnyFieldMeta): string | undefined {
  if (!meta.isTouched || !meta.errors.length) return;

  return (
    compact(meta.errors.map((error) => resolveError(error))).join(", ") ||
    undefined
  );
}
