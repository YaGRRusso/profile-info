import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { ProjectModel } from "@/modules/projects/schemas/project.schema";
import { SkillDeletedEvent } from "@/modules/skills/events/skill-deleted.event";

@Injectable()
export class OnSkillDeletedListener {
  constructor(
    @InjectModel(ProjectModel.name)
    private readonly projectModel: Model<ProjectModel>
  ) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.projectModel
      .updateMany({ skills: skillId }, { $pull: { skills: skillId } })
      .exec();
  }
}
