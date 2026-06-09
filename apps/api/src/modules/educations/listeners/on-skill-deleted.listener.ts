import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { SkillDeletedEvent } from "@/modules/skills/events/skill-deleted.event";

@Injectable()
export class OnSkillDeletedListener {
  constructor(
    @InjectModel(EducationModel.name)
    private readonly educationModel: Model<EducationModel>
  ) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.educationModel
      .updateMany({ skills: skillId }, { $pull: { skills: skillId } })
      .exec();
  }
}
