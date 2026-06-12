import {
  ConnectionError,
  OpenRouterError,
  ProviderOverloadedResponseError,
  RequestTimeoutError,
  ServiceUnavailableResponseError,
} from "@openrouter/sdk/models/errors";

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

export function isRetryableOpenRouterError(error: unknown): boolean {
  if (
    error instanceof ConnectionError ||
    error instanceof RequestTimeoutError ||
    error instanceof ProviderOverloadedResponseError ||
    error instanceof ServiceUnavailableResponseError
  ) {
    return true;
  }

  if (error instanceof OpenRouterError) {
    return RETRYABLE_STATUS_CODES.has(error.statusCode);
  }

  return false;
}
