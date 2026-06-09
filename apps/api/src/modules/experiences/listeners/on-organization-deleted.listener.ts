import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { OrganizationDeletedEvent } from "@/modules/organizations/events/organization-deleted.event";

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
