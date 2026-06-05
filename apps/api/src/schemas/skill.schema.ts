import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type {
  CallbackWithoutResultAndOptionalError,
  HydratedDocument,
} from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";

@Schema({ timestamps: true })
export class SkillModel extends BaseModel {
  @Prop({ type: Number, required: true, default: 0 })
  relevance: number;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: String,
    required: true,
    enum: ["LANGUAGE", "FRONTEND", "BACKEND", "DATA", "DEVOPS"],
    index: true,
  })
  category: string;
}

export type SkillDocument = HydratedDocument<SkillModel>;
export const SkillSchema = SchemaFactory.createForClass(SkillModel);

SkillSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (
    this: SkillDocument,
    next: CallbackWithoutResultAndOptionalError
  ) {
    try {
      const courseModel = this.model("CourseModel");
      await courseModel.updateMany(
        { skills: this._id },
        { $pull: { skills: this._id } }
      );

      const educationModel = this.model("EducationModel");
      await educationModel.updateMany(
        { skills: this._id },
        { $pull: { skills: this._id } }
      );

      const experienceModel = this.model("ExperienceModel");
      await experienceModel.updateMany(
        { "roles.skills": this._id },
        { $pull: { "roles.$[roleElem].skills": this._id } },
        { arrayFilters: [{ "roleElem.skills": this._id }] }
      );

      const projectModel = this.model("ProjectModel");
      await projectModel.updateMany(
        { skills: this._id },
        { $pull: { skills: this._id } }
      );

      next();
    } catch (error) {
      next(error);
    }
  }
);
