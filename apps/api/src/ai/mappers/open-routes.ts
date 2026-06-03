import { ChatResult } from "@openrouter/sdk/models";
import { GenericIaEntity } from "../entities/ai.entity";
import { ChatFinishReason } from "../enums/finish-reason.enum";
import { OpenRouterRole } from "../enums/role.enum";

export const openRouterMapper = (result: ChatResult): GenericIaEntity => ({
  messages: result.choices.map((choice) => ({
    finishReason: choice.finishReason as ChatFinishReason,
    message: {
      role: choice.message.role as OpenRouterRole,
      content: choice.message.content,
      reasoning: choice.message.reasoning,
      refusal: choice.message.refusal,
    },
  })),
  usage: {
    completionTokens: result?.usage?.completionTokens,
    promptTokens: result?.usage?.promptTokens,
    totalTokens: result?.usage?.totalTokens,
    cost: result?.usage?.cost,
  },
});
