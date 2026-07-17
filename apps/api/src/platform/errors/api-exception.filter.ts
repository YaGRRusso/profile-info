import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common";
import { GqlArgumentsHost, GqlExceptionFilter } from "@nestjs/graphql";
import type { Response } from "express";
import { COMMON_UNEXPECTED } from "@/core/errors/common.messages";
import { isErrorMessage, localizeError } from "@/core/errors/error-message";
import { mapPersistenceError } from "@/core/persistence/persistence-error.mapper";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const acceptLanguage = requestLanguage(host);
    const response = resolveApiError(exception, acceptLanguage);

    if (host.getType<"graphql">() === "graphql") {
      return new HttpException(response, response.statusCode);
    }

    const httpResponse = host.switchToHttp().getResponse<Response>();
    httpResponse.status(response.statusCode).json(response);
  }
}

export function resolveApiError(
  exception: unknown,
  acceptLanguage?: string
): { message: string; statusCode: number } {
  const httpException = normalizeException(exception);
  const exceptionResponse = httpException.getResponse();
  const message = isErrorMessage(exceptionResponse)
    ? exceptionResponse
    : COMMON_UNEXPECTED;
  const localizedMessage = localizeError(message, acceptLanguage);

  return {
    message: localizedMessage,
    statusCode: httpException.getStatus(),
  };
}

function normalizeException(exception: unknown): HttpException {
  if (exception instanceof HttpException) return exception;

  const persistenceException = mapPersistenceError(exception);
  if (persistenceException) return persistenceException;

  return new InternalServerErrorException(COMMON_UNEXPECTED);
}

type RequestHeaders = Record<string, string | string[] | undefined>;

function requestLanguage(host: ArgumentsHost): string | undefined {
  const headers =
    host.getType<"graphql">() === "graphql"
      ? GqlArgumentsHost.create(host).getContext<{
          req: { headers: RequestHeaders };
        }>().req.headers
      : host.switchToHttp().getRequest<{ headers: RequestHeaders }>().headers;

  const acceptLanguage = headers["accept-language"];
  return Array.isArray(acceptLanguage) ? acceptLanguage[0] : acceptLanguage;
}
