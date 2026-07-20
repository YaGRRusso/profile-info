import { Module } from "@nestjs/common";
import { ErrorMonitoringProvider } from "./error-monitoring.provider";
import { SentryController } from "./sentry.controller";
import { SentryService } from "./sentry.service";

@Module({
  controllers: [SentryController],
  exports: [ErrorMonitoringProvider],
  providers: [{ provide: ErrorMonitoringProvider, useClass: SentryService }],
})
export class SentryModule {}
