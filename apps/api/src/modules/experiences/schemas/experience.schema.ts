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
export class ExperienceMessagesModel {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;
}

@Schema({ _id: false })
export class ExperienceRoleModel {
  @Prop({
    required: true,
    type: [createTranslationModel(ExperienceMessagesModel)],
  })
  i18n: TranslationModel<ExperienceMessagesModel>[];

  @Prop({
    type: SchemaFactory.createForClass(DateRangeModel),
  })
  period?: DateRangeModel;

  @Prop({
    type: [{ ref: SkillModel.name, type: mongoose.Schema.Types.ObjectId }],
  })
  skillIds?: (mongoose.Types.ObjectId | string)[];
}

@Schema({ timestamps: true })
export class ExperienceModel extends BaseModel {
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
  organizationId?: mongoose.Types.ObjectId | string;

  @Prop({
    enum: ["FULL_TIME", "PART_TIME", "FREELANCE", "VOLUNTEER"],
    index: true,
    required: true,
    type: String,
  })
  category: string;

  @Prop({
    required: true,
    type: [SchemaFactory.createForClass(ExperienceRoleModel)],
  })
  roles: ExperienceRoleModel[];
}

export type ExperienceDocument = HydratedDocument<ExperienceModel>;
export const ExperienceSchema = SchemaFactory.createForClass(ExperienceModel);
ExperienceSchema.index({ ownerId: 1, slug: 1 }, { sparse: true, unique: true });
