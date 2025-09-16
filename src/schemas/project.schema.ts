// project.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { SkillModel } from "./skill.schema";

@Schema({ _id: false })
export class ProjectTranslationModel {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ timestamps: true })
export class ProjectModel {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String })
  demoUrl: string;

  @Prop({ type: String })
  repositoryUrl: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: SkillModel.name }] })
  skills: SkillModel[];

  @Prop({ type: Map, of: ProjectTranslationModel, required: true })
  i18n: Record<string, ProjectTranslationModel>;
}

export type ProjectDocument = HydratedDocument<ProjectModel>;
export const ProjectSchema = SchemaFactory.createForClass(ProjectModel);
