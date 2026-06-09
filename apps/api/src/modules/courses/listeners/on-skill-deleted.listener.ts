import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { CoursesService } from "@/modules/courses/courses.service";

@Injectable()
export class OnSkillDeletedListener {
  constructor(private readonly coursesService: CoursesService) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.coursesService.detachSkill(skillId);
  }
}
