import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { UsersService } from "@/modules/users/users.service";

@Injectable()
export class OnSkillDeletedListener {
  constructor(private readonly usersService: UsersService) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.usersService.detachSkill(skillId);
  }
}
