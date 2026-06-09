import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { EducationsService } from "@/modules/educations/educations.service";

@Injectable()
export class OnSkillDeletedListener {
  constructor(private readonly educationsService: EducationsService) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.educationsService.detachSkill(skillId);
  }
}
