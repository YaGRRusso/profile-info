import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  CallbackWithoutResultAndOptionalError,
  HydratedDocument,
} from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";

@Schema({ _id: false })
export class OrganizationMessagesModel {
  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ timestamps: true })
export class OrganizationModel extends BaseModel {
  @Prop({ type: Number, required: true, default: 0 })
  relevance: number;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  website: string;

  @Prop({ type: String, required: true })
  logo: string;

  @Prop({
    type: [createTranslationModel(OrganizationMessagesModel)],
    required: true,
  })
  i18n: TranslationModel<OrganizationMessagesModel>[];

  @Prop({
    type: String,
    required: true,
    enum: ["COMPANY", "SCHOOL", "OTHER"],
    index: true,
  })
  category: string;
}

export type OrganizationDocument = HydratedDocument<OrganizationModel>;
export const OrganizationSchema =
  SchemaFactory.createForClass(OrganizationModel);

OrganizationSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (
    this: OrganizationDocument,
    next: CallbackWithoutResultAndOptionalError
  ) {
    try {
      const courseModel = this.model("CourseModel");
      await courseModel.deleteMany({ organization: this._id });

      const educationModel = this.model("EducationModel");
      await educationModel.deleteMany({ organization: this._id });

      const experienceModel = this.model("ExperienceModel");
      await experienceModel.deleteMany({ organization: this._id });

      next();
    } catch (error) {
      next(error);
    }
  }
);
