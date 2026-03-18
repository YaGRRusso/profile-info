import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";
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
export class ProjectModel extends BaseModel {
  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: SkillModel.name }],
  })
  skills?: mongoose.Types.ObjectId[];

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
