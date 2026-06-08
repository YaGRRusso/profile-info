import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { CourseModel } from "@/schemas/course.schema";
import { SkillDeletedEvent } from "@/skills/events/skill-deleted.event";

@Injectable()
export class OnSkillDeletedListener {
  constructor(
    @InjectModel(CourseModel.name)
    private readonly courseModel: Model<CourseModel>
  ) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.courseModel
      .updateMany({ skills: skillId }, { $pull: { skills: skillId } })
      .exec();
  }
}
