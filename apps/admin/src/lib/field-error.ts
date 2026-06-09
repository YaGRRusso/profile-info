import type { AnyFieldMeta } from "@tanstack/react-form";

export function fieldError(meta: AnyFieldMeta): string | undefined {
  if (!meta.isTouched || !meta.errors.length) return;
  return (
    meta.errors
      .map((e) => e?.message || e?.code)
      .filter(Boolean)
      .join(", ") || undefined
  );
}
