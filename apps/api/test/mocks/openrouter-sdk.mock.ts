export class OpenRouterError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message?: string) {
    super(message);
    this.name = "OpenRouterError";
    this.statusCode = statusCode;
  }
}

export class ConnectionError extends OpenRouterError {
  constructor(message?: string) {
    super(503, message);
    this.name = "ConnectionError";
  }
}

export class RequestTimeoutError extends OpenRouterError {
  constructor(message?: string) {
    super(408, message);
    this.name = "RequestTimeoutError";
  }
}

export class ProviderOverloadedResponseError extends OpenRouterError {
  constructor(message?: string) {
    super(503, message);
    this.name = "ProviderOverloadedResponseError";
  }
}

export class ServiceUnavailableResponseError extends OpenRouterError {
  constructor(message?: string) {
    super(503, message);
    this.name = "ServiceUnavailableResponseError";
  }
}

export class OpenRouter {
  chat = {
    send: jest.fn(),
  };
}

export type ChatRequest = Record<string, unknown>;
export type ChatResult = Record<string, unknown>;
