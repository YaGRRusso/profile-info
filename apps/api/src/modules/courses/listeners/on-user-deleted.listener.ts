import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { CoursesService } from "@/modules/courses/courses.service";

@Injectable()
export class OnUserDeletedListener {
  constructor(private readonly coursesService: CoursesService) {}

  @OnEvent(DomainEvents.user.deleted)
  async handle({ userId }: UserDeletedEvent) {
    await this.coursesService.purgeByOwner(userId);
  }
}
