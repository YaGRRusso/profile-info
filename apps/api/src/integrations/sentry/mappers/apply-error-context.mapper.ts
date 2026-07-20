import type { Scope } from "@sentry/nestjs";
import type { IntegrationErrorContext } from "../error-monitoring.provider";

export function applyErrorContext(
  scope: Scope,
  context?: IntegrationErrorContext
): void {
  if (!context) {
    return;
  }

  if (context.tags) {
    for (const [key, value] of Object.entries(context.tags)) {
      scope.setTag(key, value);
    }
  }

  if (context.extras) {
    for (const [key, value] of Object.entries(context.extras)) {
      scope.setExtra(key, value);
    }
  }
}
