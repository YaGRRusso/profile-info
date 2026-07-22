import { isOpenRouterChatResult } from "./is-open-router-chat-result.helper";

describe("isOpenRouterChatResult", () => {
  it("returns true for a chat completion object", () => {
    expect(
      isOpenRouterChatResult({
        choices: [],
        created: 0,
        id: "id",
        model: "model",
        object: "chat.completion",
        systemFingerprint: null,
      })
    ).toBe(true);
  });

  it("returns false for streaming-like values without choices", () => {
    expect(isOpenRouterChatResult({})).toBe(false);
    expect(isOpenRouterChatResult(null)).toBe(false);
    expect(isOpenRouterChatResult(undefined)).toBe(false);
  });
});
