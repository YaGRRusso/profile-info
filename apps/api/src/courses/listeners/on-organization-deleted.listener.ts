import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/organizations/events/organization-deleted.event";
import { CourseModel } from "@/schemas/course.schema";

@Injectable()
export class OnOrganizationDeletedListener {
  constructor(
    @InjectModel(CourseModel.name)
    private readonly courseModel: Model<CourseModel>
  ) {}

  @OnEvent(DomainEvents.organization.deleted)
  async handle({ organizationId }: OrganizationDeletedEvent) {
    await this.courseModel.deleteMany({ organization: organizationId }).exec();
  }
}
