import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { ApiTokensService } from "@/modules/api-tokens/api-tokens.service";

@Injectable()
export class OnUserDeletedListener {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  @OnEvent(DomainEvents.user.deleted)
  async handle({ userId }: UserDeletedEvent) {
    await this.apiTokensService.purgeByOwner(userId);
  }
}
