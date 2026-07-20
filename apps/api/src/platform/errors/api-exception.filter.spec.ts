import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import type { TranslateOptions } from "nestjs-i18n";
import { i18nKey } from "@/core/i18n/i18n";
import { resolveApiError } from "./api-exception.filter";

const INTERPOLATION_ARG = /\{(\w+)\}/g;

const translations: Record<string, Record<string, string>> = {
  en: {
    "common.UNEXPECTED": "Something went wrong",
    "persistence.DUPLICATE": 'A record with {field} "{value}" already exists',
    "users.ACCOUNT_DISABLED": "Account pending approval",
  },
  es: {
    "common.UNEXPECTED": "Algo salió mal",
    "users.ACCOUNT_DISABLED": "Cuenta pendiente de aprobación",
  },
  pt: {
    "common.UNEXPECTED": "Algo deu errado",
    "persistence.DUPLICATE": 'Já existe um registro com {field} "{value}"',
    "users.ACCOUNT_DISABLED": "Conta aguardando aprovação",
  },
};

function translateFor(lang: string) {
  const catalog = translations[lang] ?? translations.en;
  return (key: string, options?: TranslateOptions) => {
    const template = catalog[key] ?? catalog["common.UNEXPECTED"] ?? key;
    const args = options?.args;
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      return template;
    }

    return template.replace(INTERPOLATION_ARG, (_, name: string) =>
      String(Reflect.get(args, name) ?? `{${name}}`)
    );
  };
}

describe("resolveApiError", () => {
  it("localizes known errors", () => {
    expect(
      resolveApiError(
        new UnauthorizedException(i18nKey("users.ACCOUNT_DISABLED")),
        translateFor("pt")
      )
    ).toEqual({
      message: "Conta aguardando aprovação",
      statusCode: HttpStatus.UNAUTHORIZED,
    });

    expect(
      resolveApiError(
        new UnauthorizedException(i18nKey("users.ACCOUNT_DISABLED")),
        translateFor("es")
      )
    ).toEqual({
      message: "Cuenta pendiente de aprobación",
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  });

  it("interpolates args from the exception body", () => {
    expect(
      resolveApiError(
        new ConflictException(
          i18nKey("persistence.DUPLICATE", {
            field: "email",
            value: "a@b.com",
          })
        ),
        translateFor("pt")
      )
    ).toEqual({
      message: 'Já existe um registro com email "a@b.com"',
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it("uses the fallback for errors without localized messages", () => {
    expect(
      resolveApiError(new BadRequestException("Invalid"), translateFor("en"))
    ).toEqual({
      message: "Something went wrong",
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it("uses the fallback for unknown errors", () => {
    expect(resolveApiError(new Error("boom"), translateFor("en"))).toEqual({
      message: "Something went wrong",
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it("preserves HTTP statuses", () => {
    expect(
      resolveApiError(new ConflictException(), translateFor("en")).statusCode
    ).toBe(HttpStatus.CONFLICT);
  });
});
