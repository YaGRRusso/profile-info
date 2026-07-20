import {
  BadGatewayException,
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { mapResendError } from "./resend-error.mapper";

describe("mapResendError", () => {
  it("maps auth errors to UnauthorizedException", () => {
    const error = mapResendError({
      message: "Invalid API key",
      name: "invalid_api_key",
      statusCode: 401,
    });

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: "email.UNAUTHORIZED" })
    );
  });

  it("maps validation errors to BadRequestException", () => {
    const error = mapResendError({
      message: "Invalid from",
      name: "invalid_from_address",
      statusCode: 422,
    });

    expect(error).toBeInstanceOf(BadRequestException);
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: "email.INVALID_REQUEST" })
    );
  });

  it("maps rate limits to ServiceUnavailableException", () => {
    const error = mapResendError({
      message: "Too many requests",
      name: "rate_limit_exceeded",
      statusCode: 429,
    });

    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: "email.PROVIDER_FAILURE" })
    );
  });

  it("maps unknown provider errors to BadGatewayException", () => {
    const error = mapResendError({
      message: "Boom",
      name: "application_error",
      statusCode: 500,
    });

    expect(error).toBeInstanceOf(BadGatewayException);
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: "email.PROVIDER_FAILURE" })
    );
  });

  it("maps non-Resend errors to BadGatewayException", () => {
    const error = mapResendError(new Error("network down"));

    expect(error).toBeInstanceOf(BadGatewayException);
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: "email.PROVIDER_FAILURE" })
    );
  });
});
