import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import { EducationsService } from "@/modules/educations/educations.service";

@Injectable()
export class OnOrganizationDeletedListener {
  constructor(private readonly educationsService: EducationsService) {}

  @OnEvent(DomainEvents.organization.deleted)
  async handle({ organizationId }: OrganizationDeletedEvent) {
    await this.educationsService.purgeByOrganization(organizationId);
  }
}
