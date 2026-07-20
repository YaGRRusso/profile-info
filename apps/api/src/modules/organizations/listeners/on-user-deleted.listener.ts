import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { OrganizationsService } from "@/modules/organizations/organizations.service";

@Injectable()
export class OnUserDeletedListener {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @OnEvent(DomainEvents.user.deleted)
  async handle({ userId }: UserDeletedEvent) {
    await this.organizationsService.purgeLocalByOwner(userId);
  }
}
