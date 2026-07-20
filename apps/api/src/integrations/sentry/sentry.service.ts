import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { captureException, init, withScope } from "@sentry/nestjs";
import type { Env } from "@/core/configs/env.validation";
import {
  ErrorMonitoringProvider,
  type IntegrationErrorContext,
} from "./error-monitoring.provider";
import { applyErrorContext } from "./mappers/apply-error-context.mapper";
import { scrubSentryEvent } from "./mappers/scrub-sentry-event.mapper";

@Injectable()
export class SentryService extends ErrorMonitoringProvider {
  private readonly enabled: boolean;

  constructor(config: ConfigService<Env, true>) {
    super();

    const nodeEnv = config.getOrThrow("NODE_ENV");
    const sentryDsn = config.get("SENTRY_DSN");
    const isTest = nodeEnv === "test";

    this.enabled = !isTest && Boolean(sentryDsn);
    if (!this.enabled) return;

    init({
      beforeSend(event) {
        return scrubSentryEvent(event);
      },
      dsn: sentryDsn,
      environment: nodeEnv,
      sendDefaultPii: false,
      tracesSampleRate: 0.1,
    });
  }

  captureException(error: unknown, context?: IntegrationErrorContext): void {
    if (!this.enabled) return;

    withScope((scope) => {
      applyErrorContext(scope, context);
      captureException(error);
    });
  }
}
