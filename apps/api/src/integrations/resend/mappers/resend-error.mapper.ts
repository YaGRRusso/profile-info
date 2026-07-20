import {
  BadGatewayException,
  BadRequestException,
  type HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { ErrorResponse } from "resend";
import { i18nKey } from "@/core/i18n/i18n";

export function isResendErrorResponse(error: unknown): error is ErrorResponse {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return (
    "message" in error &&
    typeof error.message === "string" &&
    "statusCode" in error
  );
}

export function mapResendError(error: unknown): HttpException {
  if (!isResendErrorResponse(error)) {
    return new BadGatewayException(i18nKey("email.PROVIDER_FAILURE"));
  }

  const status = error.statusCode;

  if (status === 401) {
    return new UnauthorizedException(i18nKey("email.UNAUTHORIZED"));
  }

  if (status === 400 || status === 422) {
    return new BadRequestException(i18nKey("email.INVALID_REQUEST"));
  }

  if (status === 429 || status === 503) {
    return new ServiceUnavailableException(i18nKey("email.PROVIDER_FAILURE"));
  }

  return new BadGatewayException(i18nKey("email.PROVIDER_FAILURE"));
}
