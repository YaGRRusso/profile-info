import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { ExperiencesService } from "@/modules/experiences/experiences.service";

@Injectable()
export class OnSkillDeletedListener {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.experiencesService.detachSkill(skillId);
  }
}
