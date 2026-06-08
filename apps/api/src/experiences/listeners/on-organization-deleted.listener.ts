import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/organizations/events/organization-deleted.event";
import { ExperienceModel } from "@/schemas/experience.schema";

@Injectable()
export class OnOrganizationDeletedListener {
  constructor(
    @InjectModel(ExperienceModel.name)
    private readonly experienceModel: Model<ExperienceModel>
  ) {}

  @OnEvent(DomainEvents.organization.deleted)
  async handle({ organizationId }: OrganizationDeletedEvent) {
    await this.experienceModel
      .deleteMany({ organization: organizationId })
      .exec();
  }
}
