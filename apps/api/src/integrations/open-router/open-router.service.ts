import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenRouter } from "@openrouter/sdk";
import type { Env } from "@/core/configs/env.validation";
import {
  AiChatProvider,
  type IntegrationChatRequest,
  type IntegrationChatResult,
} from "./ai-chat.provider";
import { isRetryableOpenRouterError } from "./helpers/is-retryable-open-router-error.helper";
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
        const result = await this.complete(request, model);

        if (index > 0)
          this.logger.warn(`Recovered OpenRouter request using model ${model}`);

        return result;
      } catch (error) {
        const canRetry =
          index < this.models.length - 1 && isRetryableOpenRouterError(error);

        if (!canRetry) {
          throw error;
        }

        this.logger.warn(
          `OpenRouter model ${model} failed, trying next model`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    throw new Error("No OpenRouter models configured");
  }

  private async complete(
    request: IntegrationChatRequest,
    model: string
  ): Promise<IntegrationChatResult> {
    const chatRequest = openRouterRequestMapper(request, model);
    const completion = await this.client.chat.send({ chatRequest });

    if (!completion) {
      throw new Error("No completion received from OpenRouter");
    }

    return openRouterResultMapper(completion);
  }
}
