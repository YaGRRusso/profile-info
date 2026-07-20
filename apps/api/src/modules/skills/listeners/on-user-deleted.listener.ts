import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { SkillsService } from "@/modules/skills/skills.service";

@Injectable()
export class OnUserDeletedListener {
  constructor(private readonly skillsService: SkillsService) {}

  @OnEvent(DomainEvents.user.deleted)
  async handle({ userId }: UserDeletedEvent) {
    await this.skillsService.purgeLocalByOwner(userId);
  }
}
