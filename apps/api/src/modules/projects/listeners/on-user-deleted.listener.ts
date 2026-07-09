import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { ProjectsService } from "@/modules/projects/projects.service";

@Injectable()
export class OnUserDeletedListener {
  constructor(private readonly projectsService: ProjectsService) {}

  @OnEvent(DomainEvents.user.deleted)
  async handle({ userId }: UserDeletedEvent) {
    await this.projectsService.purgeByOwner(userId);
  }
}
