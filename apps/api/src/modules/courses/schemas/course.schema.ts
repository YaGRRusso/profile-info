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
export class CourseMessagesModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ timestamps: true })
export class CourseModel extends BaseModel {
  @Prop({ type: Number, required: true, default: 0 })
  relevance: number;

  @Prop({ type: String, required: true })
  slug: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
    required: true,
    index: true,
  })
  ownerId: mongoose.Types.ObjectId | string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: OrganizationModel.name })
  organization?: (mongoose.Types.ObjectId | string) | string;

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
    type: [createTranslationModel(CourseMessagesModel)],
    required: true,
  })
  i18n: TranslationModel<CourseMessagesModel>[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: SkillModel.name }],
  })
  skills?: ((mongoose.Types.ObjectId | string) | string)[];

  @Prop({
    type: SchemaFactory.createForClass(DateRangeModel),
  })
  period?: DateRangeModel;
}

export type CourseDocument = HydratedDocument<CourseModel>;
export const CourseSchema = SchemaFactory.createForClass(CourseModel);
CourseSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
