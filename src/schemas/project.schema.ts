// project.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import {
  createTranslationModel,
  type TranslationModel,
} from "@/core/helpers/schema.helper";
import { UrlModel } from "@/core/schemas/url.schema";
import { SkillModel } from "./skill.schema";

@Schema({ _id: false })
export class ProjectMessagesModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ timestamps: true })
export class ProjectModel {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: SkillModel.name }],
  })
  skills: SkillModel[];

  @Prop({
    type: [{ type: createTranslationModel(ProjectMessagesModel) }],
    required: true,
  })
  i18n: TranslationModel<ProjectMessagesModel>[];

  @Prop({ type: [{ type: SchemaFactory.createForClass(UrlModel) }] })
  urls?: UrlModel[];
}

export type ProjectDocument = HydratedDocument<ProjectModel>;
export const ProjectSchema = SchemaFactory.createForClass(ProjectModel);
