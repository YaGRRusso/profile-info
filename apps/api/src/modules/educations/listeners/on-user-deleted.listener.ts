import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { EducationsService } from "@/modules/educations/educations.service";

@Injectable()
export class OnUserDeletedListener {
  constructor(private readonly educationsService: EducationsService) {}

  @OnEvent(DomainEvents.user.deleted)
  async handle({ userId }: UserDeletedEvent) {
    await this.educationsService.purgeByOwner(userId);
  }
}
