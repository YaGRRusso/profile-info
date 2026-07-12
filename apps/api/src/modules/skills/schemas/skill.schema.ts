import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { BaseModel } from "@/core/schemas/base.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";

@Schema({ _id: false })
export class SkillMessagesModel {
  @Prop({ type: String, required: true })
  title: string;
}

@Schema({ timestamps: true })
export class SkillModel extends BaseModel {
  @Prop({ type: Boolean, required: true, default: false, index: true })
  disabled: boolean;

  @Prop({
    type: String,
    required: true,
    enum: CatalogPartition,
    default: CatalogPartition.GLOBAL,
  })
  partition: CatalogPartition;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
  })
  ownerId?: mongoose.Types.ObjectId | string;

  @Prop({ type: String })
  slug?: string;

  @Prop({ type: String })
  category?: string;

  @Prop({
    type: [createTranslationModel(SkillMessagesModel)],
    required: true,
  })
  i18n: TranslationModel<SkillMessagesModel>[];
}

export const SkillSchema = SchemaFactory.createForClass(SkillModel);

SkillSchema.index(
  { partition: 1, ownerId: 1, slug: 1 },
  { unique: true, sparse: true }
);
