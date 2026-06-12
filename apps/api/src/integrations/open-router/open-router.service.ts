import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenRouter } from "@openrouter/sdk";
import {
  AiChatProvider,
  type IntegrationChatRequest,
  type IntegrationChatResult,
} from "./ai-chat.provider";
import { openRouterRequestMapper } from "./mappers/open-router-request.mapper";
import { openRouterResultMapper } from "./mappers/open-router-result.mapper";

@Injectable()
export class OpenRouterService extends AiChatProvider {
  private readonly client: OpenRouter;

  constructor(config: ConfigService) {
    super();
    const apiKey = config.get("OPENROUTER_API_KEY");

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    this.client = new OpenRouter({ apiKey });
  }

  async chat(request: IntegrationChatRequest): Promise<IntegrationChatResult> {
    const chatRequest = openRouterRequestMapper(request);

    console.dir(chatRequest, { depth: null });
    const completion = await this.client.chat.send({ chatRequest });
    console.dir(completion, { depth: null });

    if (!completion) throw new Error("No completion received from OpenRouter");
    return openRouterResultMapper(completion);
  }
}
