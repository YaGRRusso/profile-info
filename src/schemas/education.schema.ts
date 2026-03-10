import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import { DateRangeModel } from "@/core/schemas/daterange.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";
import { SkillModel } from "./skill.schema";

@Schema({ _id: false })
export class EducationMessagesModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ _id: false })
export class EducationSchoolModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, required: true })
  thumbnail: string;
}

@Schema({ timestamps: true })
export class EducationModel {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({
    type: SchemaFactory.createForClass(EducationSchoolModel),
    required: true,
  })
  school: EducationSchoolModel;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String })
  url?: string;

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
  skills?: (SkillModel | mongoose.Types.ObjectId | string)[]; // reference on create and populate on query

  @Prop({
    type: SchemaFactory.createForClass(DateRangeModel),
  })
  date?: DateRangeModel;
}

export type EducationDocument = HydratedDocument<EducationModel>;
export const EducationSchema = SchemaFactory.createForClass(EducationModel);
