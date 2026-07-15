import type { AnyFieldMeta } from "@tanstack/react-form";
import { compact } from "lodash";
import i18n from "@/i18n";

function errorMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return;

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }
}

function issueBound(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return;

  if ("minimum" in error && typeof error.minimum === "number") {
    return error.minimum;
  }
  if ("maximum" in error && typeof error.maximum === "number") {
    return error.maximum;
  }
}

function resolveError(error: unknown): string | undefined {
  const key = errorMessage(error);
  if (!key) return;

  const value = issueBound(error);

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
