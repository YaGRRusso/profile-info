import { scrubSentryEvent } from "./scrub-sentry-event.mapper";

describe("scrubSentryEvent", () => {
  it("filters sensitive request headers and cookies", () => {
    const event = scrubSentryEvent({
      request: {
        cookies: "session=abc",
        headers: {
          authorization: "Bearer secret",
          "content-type": "application/json",
          "x-api-key": "pi_secret",
        },
      },
    });

    expect(event.request).toEqual({
      cookies: "[Filtered]",
      headers: {
        authorization: "[Filtered]",
        "content-type": "application/json",
        "x-api-key": "[Filtered]",
      },
    });
  });

  it("filters nested sensitive keys in extra and body", () => {
    const event = scrubSentryEvent({
      extra: {
        nested: { password: "hunter2", role: "USER" },
        safe: true,
      },
      request: {
        data: { email: "a@b.c", jwt: "token", password: "x" },
      },
    });

    expect(event.extra).toEqual({
      nested: { password: "[Filtered]", role: "USER" },
      safe: true,
    });
    expect(event.request).toEqual({
      data: {
        email: "a@b.c",
        jwt: "[Filtered]",
        password: "[Filtered]",
      },
    });
  });
});
