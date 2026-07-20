import {
  BadGatewayException,
  BadRequestException,
  type HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { ErrorResponse } from "resend";
import {
  EMAIL_INVALID_REQUEST,
  EMAIL_PROVIDER_FAILURE,
  EMAIL_UNAUTHORIZED,
} from "../resend.messages";

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
    return new BadGatewayException(EMAIL_PROVIDER_FAILURE);
  }

  const status = error.statusCode;

  if (status === 401) {
    return new UnauthorizedException(EMAIL_UNAUTHORIZED);
  }

  if (status === 400 || status === 422) {
    return new BadRequestException(EMAIL_INVALID_REQUEST);
  }

  if (status === 429 || status === 503) {
    return new ServiceUnavailableException(EMAIL_PROVIDER_FAILURE);
  }

  return new BadGatewayException(EMAIL_PROVIDER_FAILURE);
}
