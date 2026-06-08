import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { ExperienceModel } from "@/schemas/experience.schema";
import { SkillDeletedEvent } from "@/skills/events/skill-deleted.event";

@Injectable()
export class OnSkillDeletedListener {
  constructor(
    @InjectModel(ExperienceModel.name)
    private readonly experienceModel: Model<ExperienceModel>
  ) {}

  @OnEvent(DomainEvents.skill.deleted)
  async handle({ skillId }: SkillDeletedEvent) {
    await this.experienceModel
      .updateMany(
        { "roles.skills": skillId },
        { $pull: { "roles.$[roleElem].skills": skillId } },
        { arrayFilters: [{ "roleElem.skills": skillId }] }
      )
      .exec();
  }
}
