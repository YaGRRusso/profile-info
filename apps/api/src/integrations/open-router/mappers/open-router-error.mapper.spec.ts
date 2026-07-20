import { BadGatewayException } from "@nestjs/common";
import { mapOpenRouterError } from "./open-router-error.mapper";

describe("mapOpenRouterError", () => {
  it("maps auth errors to UnauthorizedException", () => {
    const error = mapOpenRouterError(
      Object.assign(new Error("Invalid API key"), {
        name: "UnauthorizedResponseError",
        statusCode: 401,
      })
    );

    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: "open-router.UNAUTHORIZED" })
    );
  });

  it("maps other errors to BadGatewayException", () => {
    const error = mapOpenRouterError(new Error("model unavailable"));

    expect(error).toBeInstanceOf(BadGatewayException);
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: "open-router.PROVIDER_FAILURE" })
    );
  });
});
