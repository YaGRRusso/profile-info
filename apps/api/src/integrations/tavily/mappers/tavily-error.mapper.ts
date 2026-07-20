import { BadGatewayException, type HttpException } from "@nestjs/common";
import { i18nKey } from "@/core/i18n/i18n";

export function mapTavilyError(_error: unknown): HttpException {
  return new BadGatewayException(i18nKey("tavily.PROVIDER_FAILURE"));
}
