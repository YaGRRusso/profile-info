import { Injectable } from "@nestjs/common";
import {
  AiChatProvider,
  type IntegrationChatRequest,
} from "@/integrations/open-router/ai-chat.provider";
import { AiEntity } from "../entities/ai-response.entity";
import { mapChatResultToEntity } from "../mappers/chat-result.mapper";

@Injectable()
export class ChatService {
  constructor(private readonly aiChatProvider: AiChatProvider) {}

  async chat(request: IntegrationChatRequest): Promise<AiEntity> {
    const result = await this.aiChatProvider.chat(request);
    return mapChatResultToEntity(result);
  }
}
