import { resendResultMapper } from "./resend-result.mapper";

describe("resendResultMapper", () => {
  it("maps the provider id", () => {
    expect(resendResultMapper({ id: "email_123" })).toEqual({
      id: "email_123",
    });
  });
});
