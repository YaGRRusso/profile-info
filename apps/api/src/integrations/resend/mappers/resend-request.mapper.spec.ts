import { resendRequestMapper } from "./resend-request.mapper";

describe("resendRequestMapper", () => {
  const baseMessage = {
    subject: "Hello",
    to: "user@example.com",
  };

  it("maps html-only messages", () => {
    expect(
      resendRequestMapper(
        { ...baseMessage, html: "<p>Hi</p>" },
        "from@example.com"
      )
    ).toEqual({
      from: "from@example.com",
      html: "<p>Hi</p>",
      replyTo: undefined,
      subject: "Hello",
      text: undefined,
      to: "user@example.com",
    });
  });

  it("maps text-only messages", () => {
    expect(
      resendRequestMapper({ ...baseMessage, text: "Hi" }, "from@example.com")
    ).toEqual({
      from: "from@example.com",
      html: undefined,
      replyTo: undefined,
      subject: "Hello",
      text: "Hi",
      to: "user@example.com",
    });
  });

  it("maps html and text together with replyTo", () => {
    expect(
      resendRequestMapper(
        {
          ...baseMessage,
          html: "<p>Hi</p>",
          replyTo: "reply@example.com",
          text: "Hi",
          to: ["a@example.com", "b@example.com"],
        },
        "Sender <from@example.com>"
      )
    ).toEqual({
      from: "Sender <from@example.com>",
      html: "<p>Hi</p>",
      replyTo: "reply@example.com",
      subject: "Hello",
      text: "Hi",
      to: ["a@example.com", "b@example.com"],
    });
  });
});
