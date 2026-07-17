import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { USER_ACCOUNT_DISABLED } from "@/modules/users/users.messages";
import { resolveApiError } from "./api-exception.filter";

describe("resolveApiError", () => {
  it("localizes known errors", () => {
    expect(
      resolveApiError(new UnauthorizedException(USER_ACCOUNT_DISABLED), "pt-BR")
    ).toEqual({
      message: USER_ACCOUNT_DISABLED.pt,
      statusCode: HttpStatus.UNAUTHORIZED,
    });

    expect(
      resolveApiError(new UnauthorizedException(USER_ACCOUNT_DISABLED), "es")
    ).toEqual({
      message: USER_ACCOUNT_DISABLED.es,
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  });

  it("uses the fallback for errors without localized messages", () => {
    expect(resolveApiError(new BadRequestException("Invalid"), "en")).toEqual({
      message: "Something went wrong",
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it("uses the fallback for unknown errors", () => {
    expect(resolveApiError(new Error("boom"), "en")).toEqual({
      message: "Something went wrong",
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it("preserves HTTP statuses", () => {
    expect(resolveApiError(new ConflictException(), "en").statusCode).toBe(
      HttpStatus.CONFLICT
    );
  });
});
