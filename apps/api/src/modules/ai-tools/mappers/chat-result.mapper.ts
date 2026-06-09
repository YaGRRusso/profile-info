import type { IntegrationChatResult } from "@/integrations/open-router/ai-chat.provider";
import { AiEntity } from "../entities/ai-response.entity";
import { ChatRole } from "../enums/chat-role.enum";
import { ChatFinishReason } from "../enums/finish-reason.enum";

const CHAT_ROLE_BY_VALUE: Record<string, ChatRole> = {
  assistant: ChatRole.ASSISTANT,
  developer: ChatRole.DEVELOPER,
  system: ChatRole.SYSTEM,
  tool: ChatRole.TOOL,
  user: ChatRole.USER,
};

const CHAT_FINISH_REASON_BY_VALUE: Record<string, ChatFinishReason> = {
  tool_calls: ChatFinishReason.TOOL_CALLS,
  stop: ChatFinishReason.STOP,
  length: ChatFinishReason.LENGTH,
  content_filter: ChatFinishReason.CONTENT_FILTER,
  error: ChatFinishReason.ERROR,
};

function mapChatRole(role: string): ChatRole {
  return CHAT_ROLE_BY_VALUE[role] ?? ChatRole.ASSISTANT;
}

function mapFinishReason(finishReason: string | null): ChatFinishReason | null {
  if (finishReason === null) return null;
  return CHAT_FINISH_REASON_BY_VALUE[finishReason] ?? null;
}

export function mapChatResultToEntity(result: IntegrationChatResult): AiEntity {
  return {
    messages: result.messages.map((choice) => ({
      finishReason: mapFinishReason(choice.finishReason),
      message: {
        role: mapChatRole(choice.message.role),
        content: choice.message.content,
        reasoning: choice.message.reasoning,
        refusal: choice.message.refusal,
      },
    })),
    usage: result.usage,
  };
}
