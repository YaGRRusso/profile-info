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

@Schema({ _id: false })
export class ProjectTranslationLocaleModel {
  @Prop({ type: String, required: true })
  locale: string;

  @Prop({ type: ProjectTranslationModel, required: true })
  messages: ProjectTranslationModel;
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

  @Prop({ type: [{ type: SchemaFactory.createForClass(ProjectTranslationLocaleModel) }], required: true })
  i18n: ProjectTranslationLocaleModel[];
}

export type ProjectDocument = HydratedDocument<ProjectModel>;
export const ProjectSchema = SchemaFactory.createForClass(ProjectModel);
