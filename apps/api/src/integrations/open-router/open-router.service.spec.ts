import {
  BadGatewayException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { OpenRouterService } from "./open-router.service";

const sendMock = jest.fn();

jest.mock("@openrouter/sdk", () => ({
  OpenRouter: jest.fn().mockImplementation(() => ({
    chat: { send: sendMock },
  })),
}));

const MODELS = ["model-a", "model-b", "model-c"] as const;

const chatRequest = {
  messages: [{ content: "hello", role: "user" }],
};

const successCompletion = {
  choices: [
    {
      finishReason: "stop",
      message: {
        content: "ok",
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
};

function unauthorizedError(): Error {
  return Object.assign(new Error("Invalid API key"), {
    name: "UnauthorizedResponseError",
    statusCode: 401,
  });
}

describe("OpenRouterService", () => {
  let service: OpenRouterService;

  let warnSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(Logger.prototype, "warn").mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenRouterService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === "OPENROUTER_API_KEY") return "test-key";
              if (key === "OPENROUTER_AI_MODELS") return [...MODELS];
              throw new Error(`Unexpected config key: ${key}`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get(OpenRouterService);
  });

  it("returns the first model response when it succeeds", async () => {
    sendMock.mockResolvedValueOnce(successCompletion);

    const result = await service.chat(chatRequest);

    expect(result.messages[0]?.message.content).toBe("ok");
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].chatRequest.model).toBe("model-a");
  });

  it("tries the next model for any failure, including non-transient errors", async () => {
    sendMock
      .mockRejectedValueOnce(
        new Error(
          "This model is unavailable for free. The paid version is available now"
        )
      )
      .mockResolvedValueOnce(successCompletion);

    const result = await service.chat(chatRequest);

    expect(result.messages[0]?.message.content).toBe("ok");
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock.mock.calls[0][0].chatRequest.model).toBe("model-a");
    expect(sendMock.mock.calls[1][0].chatRequest.model).toBe("model-b");
  });

  it("does not try the next model on OpenRouter auth failures", async () => {
    sendMock.mockRejectedValueOnce(unauthorizedError());

    await expect(service.chat(chatRequest)).rejects.toMatchObject({
      response: expect.objectContaining({
        message: "open-router.UNAUTHORIZED",
      }),
    });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("maps auth failures to UnauthorizedException", async () => {
    sendMock.mockRejectedValueOnce(unauthorizedError());

    await expect(service.chat(chatRequest)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it("walks the full chain and maps the last error when every model fails", async () => {
    sendMock
      .mockRejectedValueOnce(new Error("rate limited"))
      .mockRejectedValueOnce(new Error("token budget exceeded"))
      .mockRejectedValueOnce(new Error("final model unavailable"));

    await expect(service.chat(chatRequest)).rejects.toMatchObject({
      response: expect.objectContaining({
        message: "open-router.PROVIDER_FAILURE",
      }),
    });
    expect(sendMock).toHaveBeenCalledTimes(3);
    expect(
      sendMock.mock.calls.map((call) => call[0].chatRequest.model)
    ).toEqual([...MODELS]);
  });

  it("maps exhausted model failures to BadGatewayException", async () => {
    sendMock
      .mockRejectedValueOnce(new Error("rate limited"))
      .mockRejectedValueOnce(new Error("token budget exceeded"))
      .mockRejectedValueOnce(new Error("final model unavailable"));

    await expect(service.chat(chatRequest)).rejects.toBeInstanceOf(
      BadGatewayException
    );
  });

  it("logs every failed model, including the last one", async () => {
    sendMock
      .mockRejectedValueOnce(new Error("rate limited"))
      .mockRejectedValueOnce(new Error("token budget exceeded"))
      .mockRejectedValueOnce(new Error("final model unavailable"));

    await expect(service.chat(chatRequest)).rejects.toThrow();

    expect(warnSpy).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenLastCalledWith(
      "OpenRouter model model-c failed",
      "final model unavailable"
    );
  });

  it("attaches the last model error as the cause when every model fails", async () => {
    const lastError = new Error("final model unavailable");
    sendMock
      .mockRejectedValueOnce(new Error("rate limited"))
      .mockRejectedValueOnce(new Error("token budget exceeded"))
      .mockRejectedValueOnce(lastError);

    await expect(service.chat(chatRequest)).rejects.toMatchObject({
      cause: lastError,
    });
  });

  it("logs and attaches the cause when an auth failure stops the chain", async () => {
    const authError = unauthorizedError();
    sendMock.mockRejectedValueOnce(authError);

    await expect(service.chat(chatRequest)).rejects.toMatchObject({
      cause: authError,
    });
    expect(warnSpy).toHaveBeenCalledWith(
      "OpenRouter model model-a failed",
      "Invalid API key"
    );
  });
});
