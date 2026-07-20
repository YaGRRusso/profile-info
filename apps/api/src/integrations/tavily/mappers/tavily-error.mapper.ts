import { BadGatewayException, type HttpException } from "@nestjs/common";
import { TAVILY_PROVIDER_FAILURE } from "../tavily.messages";

export function mapTavilyError(_error: unknown): HttpException {
  return new BadGatewayException(TAVILY_PROVIDER_FAILURE);
}
