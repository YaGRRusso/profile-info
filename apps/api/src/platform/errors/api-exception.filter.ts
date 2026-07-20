import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import type { GqlExceptionFilter } from "@nestjs/graphql";
import type { Response } from "express";
import { I18nContext, I18nService, type TranslateOptions } from "nestjs-i18n";
import { type I18nExceptionBody, i18nKey } from "@/core/i18n/i18n";
import { mapPersistenceError } from "@/core/persistence/persistence-error.mapper";
import { ErrorMonitoringProvider } from "@/integrations/sentry/error-monitoring.provider";
import { shouldReportStatus } from "./should-report-status.helper";

type TranslateFn = (key: string, options?: TranslateOptions) => string;

@Catch()
@Injectable()
export class ApiExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
  constructor(
    private readonly errorMonitoring: ErrorMonitoringProvider,
    private readonly i18nService: I18nService
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const lang = I18nContext.current(host)?.lang ?? I18nContext.current()?.lang;
    const response = resolveApiError(exception, (key, options) =>
      translateErrorKey(
        this.i18nService,
        key,
        lang === undefined ? options : { ...options, lang }
      )
    );

    if (shouldReportStatus(response.statusCode)) {
      this.errorMonitoring.captureException(exception, {
        extras: {
          statusCode: response.statusCode,
          transport: host.getType(),
        },
        tags: { source: "api-exception-filter" },
      });
    }

    if (host.getType<"graphql">() === "graphql") {
      return new HttpException(response, response.statusCode);
    }

    const httpResponse = host.switchToHttp().getResponse<Response>();
    httpResponse.status(response.statusCode).json(response);
  }
}

export function resolveApiError(
  exception: unknown,
  translate: TranslateFn
): { message: string; statusCode: number } {
  const httpException = normalizeException(exception);
  const { key, args } = extractI18nPayload(httpException.getResponse());

  return {
    message: translate(key, args ? { args } : undefined),
    statusCode: httpException.getStatus(),
  };
}

export function translateErrorKey(
  i18n: Pick<I18nService, "t">,
  key: string,
  options?: TranslateOptions
): string {
  const translated = i18n.t(key, options) as string;
  if (translated !== key) return translated;

  return i18n.t(i18nKey("common.UNEXPECTED"), options) as string;
}

function extractI18nPayload(exceptionResponse: string | object): {
  key: string;
  args?: Record<string, unknown>;
} {
  if (typeof exceptionResponse === "string") {
    return { key: exceptionResponse };
  }

  if (typeof exceptionResponse !== "object" || exceptionResponse === null) {
    return { key: i18nKey("common.UNEXPECTED") };
  }

  const body = exceptionResponse as Partial<I18nExceptionBody> & {
    message?: unknown;
    args?: unknown;
  };

  if (typeof body.message !== "string") {
    return { key: i18nKey("common.UNEXPECTED") };
  }

  const args =
    body.args && typeof body.args === "object" && !Array.isArray(body.args)
      ? (body.args as Record<string, unknown>)
      : undefined;

  return { args, key: body.message };
}

function normalizeException(exception: unknown): HttpException {
  if (exception instanceof HttpException) return exception;

  const persistenceException = mapPersistenceError(exception);
  if (persistenceException) return persistenceException;

  return new InternalServerErrorException(i18nKey("common.UNEXPECTED"));
}
