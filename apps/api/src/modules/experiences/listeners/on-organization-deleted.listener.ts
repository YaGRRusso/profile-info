import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import { ExperiencesService } from "@/modules/experiences/experiences.service";

@Injectable()
export class OnOrganizationDeletedListener {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @OnEvent(DomainEvents.organization.deleted)
  async handle({ organizationId }: OrganizationDeletedEvent) {
    await this.experiencesService.purgeByOrganization(organizationId);
  }
}
