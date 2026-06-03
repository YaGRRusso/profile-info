import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { ChatFinishReason } from "../enums/finish-reason.enum";
import { OpenRouterRole } from "../enums/role.enum";

@ObjectType()
class UsageEntity {
  @OptionalField(() => Number)
  promptTokens?: number | null;

  @OptionalField(() => Number)
  completionTokens?: number | null;

  @OptionalField(() => Number)
  totalTokens?: number | null;

  @OptionalField(() => Number, { nullable: true })
  cost?: number | null;
}

@ObjectType()
class MessageEntity {
  @Field(() => OpenRouterRole)
  role: OpenRouterRole;

  @Field(() => String)
  content: string;

  @OptionalField(() => String, { nullable: true })
  reasoning?: string | null;

  @OptionalField(() => String, { nullable: true })
  refusal?: string | null;
}

@ObjectType()
class ChoiceEntity {
  @Field(() => MessageEntity)
  message: MessageEntity;

  @Field(() => ChatFinishReason, { nullable: true })
  finishReason: ChatFinishReason | null;
}

@ObjectType()
export class GenericIaEntity {
  @Field(() => [ChoiceEntity])
  messages: ChoiceEntity[];

  @OptionalField(() => UsageEntity)
  usage: UsageEntity;
}
