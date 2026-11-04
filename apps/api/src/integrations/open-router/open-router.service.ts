import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenRouter } from "@openrouter/sdk";
import type { Env } from "@/core/configs/env.validation";
import {
  AiChatProvider,
  type IntegrationChatRequest,
  type IntegrationChatResult,
} from "./ai-chat.provider";
import { isOpenRouterAuthError } from "./helpers/is-open-router-auth-error.helper";
import { isOpenRouterChatResult } from "./helpers/is-open-router-chat-result.helper";
import { mapOpenRouterError } from "./mappers/open-router-error.mapper";
import { openRouterRequestMapper } from "./mappers/open-router-request.mapper";
import { openRouterResultMapper } from "./mappers/open-router-result.mapper";

@Injectable()
export class OpenRouterService extends AiChatProvider {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly client: OpenRouter;
  private readonly models: Env["OPENROUTER_AI_MODELS"];

  constructor(config: ConfigService<Env, true>) {
    super();

    this.client = new OpenRouter({
      apiKey: config.getOrThrow("OPENROUTER_API_KEY"),
    });
    this.models = config.getOrThrow("OPENROUTER_AI_MODELS");
  }

  async chat(request: IntegrationChatRequest): Promise<IntegrationChatResult> {
    for (const [index, model] of this.models.entries()) {
      try {
        // biome-ignore lint/performance/noAwaitInLoops: model fallback chain must be sequential
        const result = await this.complete(request, model);

        if (index > 0)
          this.logger.warn(`Recovered OpenRouter request using model ${model}`);

        return result;
      } catch (error) {
        this.logger.warn(
          `OpenRouter model ${model} failed`,
          error instanceof Error ? error.message : String(error)
        );

        const hasNext = index < this.models.length - 1;
        const canRetry = hasNext && !isOpenRouterAuthError(error);

        if (!canRetry) {
          throw mapOpenRouterError(error);
        }
      }
    }

    throw mapOpenRouterError(new Error("No OpenRouter models configured"));
  }

  private async complete(
    request: IntegrationChatRequest,
    model: string
  ): Promise<IntegrationChatResult> {
    const chatRequest = openRouterRequestMapper(request, model);
    const completion = await this.client.chat.send({ chatRequest });

    if (!isOpenRouterChatResult(completion)) {
      throw new Error("Expected a non-streaming OpenRouter chat completion");
    }

    return openRouterResultMapper(completion);
  }
}
