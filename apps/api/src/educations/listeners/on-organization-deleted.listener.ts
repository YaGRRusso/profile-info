import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/organizations/events/organization-deleted.event";
import { EducationModel } from "@/schemas/education.schema";

@Injectable()
export class OnOrganizationDeletedListener {
  constructor(
    @InjectModel(EducationModel.name)
    private readonly educationModel: Model<EducationModel>
  ) {}

  @OnEvent(DomainEvents.organization.deleted)
  async handle({ organizationId }: OrganizationDeletedEvent) {
    await this.educationModel
      .deleteMany({ organization: organizationId })
      .exec();
  }
}
