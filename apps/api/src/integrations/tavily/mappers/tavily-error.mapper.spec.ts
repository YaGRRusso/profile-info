import { BadGatewayException } from "@nestjs/common";
import { mapTavilyError } from "./tavily-error.mapper";

describe("mapTavilyError", () => {
  it("maps provider failures to BadGatewayException", () => {
    const error = mapTavilyError(new Error("upstream down"));

    expect(error).toBeInstanceOf(BadGatewayException);
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: "tavily.PROVIDER_FAILURE" })
    );
  });
});
