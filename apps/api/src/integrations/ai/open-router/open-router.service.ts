import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenRouter } from "@openrouter/sdk";
import { AiProvider } from "../ai.provider";
import type { ChatCompletionRequest, ChatCompletionResult } from "../ai.types";
import { mapFromOpenRouterResponse } from "./mappers/open-router.mapper";
import { mapToOpenRouterRequest } from "./mappers/open-router-request.mapper";

@Injectable()
export class OpenRouterService implements AiProvider {
  private readonly client: OpenRouter;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>("OPENROUTER_API_KEY");

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

    this.client = new OpenRouter({ apiKey });
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResult> {
    const chatRequest = mapToOpenRouterRequest(request);
    const completion = await this.client.chat.send({ chatRequest });

    if (!completion) throw new Error("No completion received from OpenRouter");
    return mapFromOpenRouterResponse(completion);
  }
}
