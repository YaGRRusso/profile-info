import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import { CoursesService } from "@/modules/courses/courses.service";

@Injectable()
export class OnOrganizationDeletedListener {
  constructor(private readonly coursesService: CoursesService) {}

  @OnEvent(DomainEvents.organization.deleted)
  async handle({ organizationId }: OrganizationDeletedEvent) {
    await this.coursesService.purgeByOrganization(organizationId);
  }
}
