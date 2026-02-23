import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import {
  createTranslationModel,
  type TranslationModel,
} from "@/core/helpers/schema.helper";
import { DateRangeModel } from "@/core/schemas/daterange.schema";
import { SkillModel } from "./skill.schema";

@Schema({ _id: false })
export class ExperienceMessagesModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ _id: false })
export class ExperienceCompanyModel {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, required: true })
  image: string;
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
  date?: DateRangeModel;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: SkillModel.name }],
  })
  skills?: (SkillModel | mongoose.Types.ObjectId)[];
}

@Schema({ timestamps: true })
export class ExperienceModel {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({
    type: SchemaFactory.createForClass(ExperienceCompanyModel),
    required: true,
  })
  company: ExperienceCompanyModel;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({
    type: [SchemaFactory.createForClass(ExperienceRoleModel)],
    required: true,
  })
  roles: ExperienceRoleModel[];
}

export type ExperienceDocument = HydratedDocument<ExperienceModel>;
export const ExperienceSchema = SchemaFactory.createForClass(ExperienceModel);
