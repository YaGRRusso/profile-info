import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";

@Schema({ _id: false })
export class CourseMessagesModel {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;
}

@Schema({ timestamps: true })
export class CourseModel extends BaseModel {
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

  @Prop({ type: Number })
  hours?: number;

  @Prop({
    required: true,
    type: [createTranslationModel(CourseMessagesModel)],
  })
  i18n: TranslationModel<CourseMessagesModel>[];

  @Prop({
    type: [{ ref: SkillModel.name, type: mongoose.Schema.Types.ObjectId }],
  })
  skillIds?: ((mongoose.Types.ObjectId | string) | string)[];
}

export type CourseDocument = HydratedDocument<CourseModel>;
export const CourseSchema = SchemaFactory.createForClass(CourseModel);
CourseSchema.index({ ownerId: 1, slug: 1 }, { sparse: true, unique: true });
