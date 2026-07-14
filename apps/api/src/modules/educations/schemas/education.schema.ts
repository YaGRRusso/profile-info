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
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;
}

@Schema({ timestamps: true })
export class EducationModel extends BaseModel {
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

  @Prop({ ref: OrganizationModel.name, type: mongoose.Schema.Types.ObjectId })
  organizationId?: (mongoose.Types.ObjectId | string) | string;

  @Prop({
    enum: [
      "HIGH_SCHOOL",
      "TECHNICAL",
      "BACHELOR",
      "POSTGRAD",
      "MASTER",
      "DOCTORATE",
    ],
    index: true,
    required: true,
    type: String,
  })
  level: string;

  @Prop({
    enum: ["COMPLETE", "INCOMPLETE", "IN_PROGRESS"],
    index: true,
    required: true,
    type: String,
  })
  status: string;

  @Prop({ type: String })
  url?: string;

  @Prop({ type: String })
  image?: string;

  @Prop({
    required: true,
    type: [createTranslationModel(EducationMessagesModel)],
  })
  i18n: TranslationModel<EducationMessagesModel>[];

  @Prop({
    type: [{ ref: SkillModel.name, type: mongoose.Schema.Types.ObjectId }],
  })
  skillIds?: ((mongoose.Types.ObjectId | string) | string)[];

  @Prop({
    type: SchemaFactory.createForClass(DateRangeModel),
  })
  period?: DateRangeModel;
}

export type EducationDocument = HydratedDocument<EducationModel>;
export const EducationSchema = SchemaFactory.createForClass(EducationModel);
EducationSchema.index({ ownerId: 1, slug: 1 }, { sparse: true, unique: true });
