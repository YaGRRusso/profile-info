import {
  BadGatewayException,
  type HttpException,
  UnauthorizedException,
} from "@nestjs/common";
import { i18nKey } from "@/core/i18n/i18n";
import { isOpenRouterAuthError } from "../helpers/is-open-router-auth-error.helper";

export function mapOpenRouterError(error: unknown): HttpException {
  if (isOpenRouterAuthError(error)) {
    return new UnauthorizedException(i18nKey("open-router.UNAUTHORIZED"), {
      cause: error,
    });
  }

  return new BadGatewayException(i18nKey("open-router.PROVIDER_FAILURE"), {
    cause: error,
  });
}
