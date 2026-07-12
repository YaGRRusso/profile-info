import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";
import { DateRangeModel } from "@/core/schemas/daterange.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";

@Schema({ _id: false })
export class EducationMessagesModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ timestamps: true })
export class EducationModel extends BaseModel {
  @Prop({ type: Number, required: true, default: 0 })
  relevance: number;

  @Prop({ type: String })
  slug?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
    required: true,
    index: true,
  })
  ownerId: mongoose.Types.ObjectId | string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: OrganizationModel.name })
  organizationId?: (mongoose.Types.ObjectId | string) | string;

  @Prop({
    type: String,
    required: true,
    enum: [
      "HIGH_SCHOOL",
      "TECHNICAL",
      "BACHELOR",
      "POSTGRAD",
      "MASTER",
      "DOCTORATE",
    ],
    index: true,
  })
  level: string;

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

  @Prop({
    type: [createTranslationModel(EducationMessagesModel)],
    required: true,
  })
  i18n: TranslationModel<EducationMessagesModel>[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: SkillModel.name }],
  })
  skillIds?: ((mongoose.Types.ObjectId | string) | string)[];

  @Prop({
    type: SchemaFactory.createForClass(DateRangeModel),
  })
  period?: DateRangeModel;
}

export type EducationDocument = HydratedDocument<EducationModel>;
export const EducationSchema = SchemaFactory.createForClass(EducationModel);
EducationSchema.index({ ownerId: 1, slug: 1 }, { unique: true, sparse: true });
