import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";
import { UrlModel } from "@/core/schemas/url.schema";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";

@Schema({ _id: false })
export class ProjectMessagesModel {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;
}

@Schema({ timestamps: true })
export class ProjectModel extends BaseModel {
  @Prop({ default: 0, required: true, type: Number })
  relevance: number;

  @Prop({ type: String })
  slug?: string;

  @Prop({
    index: true,
    ref: UserModel.name,
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  ownerId: mongoose.Types.ObjectId | string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({
    type: [{ ref: SkillModel.name, type: mongoose.Schema.Types.ObjectId }],
  })
  skillIds?: (mongoose.Types.ObjectId | string)[];

  @Prop({
    required: true,
    type: [{ type: createTranslationModel(ProjectMessagesModel) }],
  })
  i18n: TranslationModel<ProjectMessagesModel>[];

  @Prop({ type: [{ type: SchemaFactory.createForClass(UrlModel) }] })
  urls?: UrlModel[];
}

export type ProjectDocument = HydratedDocument<ProjectModel>;
export const ProjectSchema = SchemaFactory.createForClass(ProjectModel);
ProjectSchema.index({ ownerId: 1, slug: 1 }, { sparse: true, unique: true });
