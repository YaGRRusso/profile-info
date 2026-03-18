import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";
import { DateRangeModel } from "@/core/schemas/daterange.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";
import { OrganizationModel } from "./organization.schema";
import { SkillModel } from "./skill.schema";

@Schema({ _id: false })
export class EducationMessagesModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ timestamps: true })
export class EducationModel extends BaseModel {
  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: OrganizationModel.name })
  organization?: (mongoose.Types.ObjectId | string) | string;

  @Prop({
    type: String,
    required: true,
    enum: ["COURSE", "DEGREE", "OTHER"],
    index: true,
  })
  category: string;

  @Prop({
    type: String,
    required: true,
    enum: ["COMPLETE", "INCOMPLETE", "IN_PROGRESS"],
    index: true,
  })
  status: string;

  @Prop({ type: String })
  url?: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number })
  hours?: number;

  @Prop({
    type: [createTranslationModel(EducationMessagesModel)],
    required: true,
  })
  i18n: TranslationModel<EducationMessagesModel>[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: SkillModel.name }],
  })
  skills?: ((mongoose.Types.ObjectId | string) | string)[];

  @Prop({
    type: SchemaFactory.createForClass(DateRangeModel),
  })
  period?: DateRangeModel;
}

export type EducationDocument = HydratedDocument<EducationModel>;
export const EducationSchema = SchemaFactory.createForClass(EducationModel);
