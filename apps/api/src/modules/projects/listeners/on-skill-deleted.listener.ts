import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { ProjectsService } from "@/modules/projects/projects.service";

@Injectable()
export class OnSkillDeletedListener {
  constructor(private readonly projectsService: ProjectsService) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.projectsService.detachSkill(skillId);
  }
}
