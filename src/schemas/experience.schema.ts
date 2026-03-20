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
export class ExperienceMessagesModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ _id: false })
export class ExperienceRoleModel {
  @Prop({
    type: [createTranslationModel(ExperienceMessagesModel)],
    required: true,
  })
  i18n: TranslationModel<ExperienceMessagesModel>[];

  @Prop({
    type: SchemaFactory.createForClass(DateRangeModel),
  })
  period?: DateRangeModel;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: SkillModel.name }],
  })
  skills?: (mongoose.Types.ObjectId | string)[];
}

@Schema({ timestamps: true })
export class ExperienceModel extends BaseModel {
  @Prop({ type: Number })
  relevance?: number;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: OrganizationModel.name })
  organization?: mongoose.Types.ObjectId | string;

  @Prop({
    type: String,
    required: true,
    enum: ["FULL_TIME", "PART_TIME", "FREELANCE", "VOLUNTEER"],
    index: true,
  })
  category: string;

  @Prop({
    type: [SchemaFactory.createForClass(ExperienceRoleModel)],
    required: true,
  })
  roles: ExperienceRoleModel[];
}

export type ExperienceDocument = HydratedDocument<ExperienceModel>;
export const ExperienceSchema = SchemaFactory.createForClass(ExperienceModel);
