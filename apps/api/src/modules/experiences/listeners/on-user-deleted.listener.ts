import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { ExperiencesService } from "@/modules/experiences/experiences.service";

@Injectable()
export class OnUserDeletedListener {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @OnEvent(DomainEvents.user.deleted)
  async handle({ userId }: UserDeletedEvent) {
    await this.experiencesService.purgeByOwner(userId);
  }
}
