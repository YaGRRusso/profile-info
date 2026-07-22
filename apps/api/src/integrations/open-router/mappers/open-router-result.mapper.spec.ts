import type { ChatResult } from "@openrouter/sdk/models";
import { openRouterResultMapper } from "./open-router-result.mapper";

describe("openRouterResultMapper", () => {
  it("maps string content as-is", () => {
    const result = openRouterResultMapper({
      choices: [
        {
          finishReason: "stop",
          message: {
            content: "hello",
            reasoning: null,
            refusal: null,
            role: "assistant",
          },
        },
      ],
      usage: {
        completionTokens: 1,
        cost: 0,
        promptTokens: 1,
        totalTokens: 2,
      },
    } as ChatResult);

    expect(result.messages[0]?.message.content).toBe("hello");
  });

  it("joins text content parts into a string", () => {
    const result = openRouterResultMapper({
      choices: [
        {
          finishReason: "stop",
          message: {
            content: [
              { text: "hello ", type: "text" },
              { text: "world", type: "text" },
            ],
            role: "assistant",
          },
        },
      ],
    } as ChatResult);

    expect(result.messages[0]?.message.content).toBe("hello world");
  });

  it("maps nullish content to an empty string", () => {
    const result = openRouterResultMapper({
      choices: [
        {
          finishReason: "stop",
          message: {
            content: null,
            role: "assistant",
          },
        },
      ],
    } as ChatResult);

    expect(result.messages[0]?.message.content).toBe("");
  });
});
