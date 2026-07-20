import { I18nContext } from "nestjs-i18n";
import type { I18nPath } from "@/generated/i18n.generated";

export function i18nKey(key: I18nPath): I18nPath {
  return key;
}

export function t(key: I18nPath, args?: Record<string, unknown>): string {
  const i18n = I18nContext.current();
  if (!i18n) {
    return key;
  }
  return i18n.t(key, args === undefined ? undefined : { args });
}
