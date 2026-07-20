import {
  BadGatewayException,
  type HttpException,
  UnauthorizedException,
} from "@nestjs/common";
import { isOpenRouterAuthError } from "../helpers/is-open-router-auth-error.helper";
import {
  OPENROUTER_PROVIDER_FAILURE,
  OPENROUTER_UNAUTHORIZED,
} from "../open-router.messages";

export function mapOpenRouterError(error: unknown): HttpException {
  if (isOpenRouterAuthError(error)) {
    return new UnauthorizedException(OPENROUTER_UNAUTHORIZED);
  }

  return new BadGatewayException(OPENROUTER_PROVIDER_FAILURE);
}
