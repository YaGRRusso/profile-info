export interface IntegrationErrorContext {
  extras?: Record<string, unknown>;
  tags?: Record<string, string>;
}

export abstract class ErrorMonitoringProvider {
  abstract captureException(
    error: unknown,
    context?: IntegrationErrorContext
  ): void;
}
