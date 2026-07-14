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
  @Prop({ required: true, type: String })
  title: string;
}

@Schema({ timestamps: true })
export class SkillModel extends BaseModel {
  @Prop({ default: false, index: true, required: true, type: Boolean })
  disabled: boolean;

  @Prop({
    default: CatalogPartition.GLOBAL,
    enum: CatalogPartition,
    required: true,
    type: String,
  })
  partition: CatalogPartition;

  @Prop({
    ref: UserModel.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  ownerId?: mongoose.Types.ObjectId | string;

  @Prop({ type: String })
  slug?: string;

  @Prop({ type: String })
  category?: string;

  @Prop({
    required: true,
    type: [createTranslationModel(SkillMessagesModel)],
  })
  i18n: TranslationModel<SkillMessagesModel>[];
}

export const SkillSchema = SchemaFactory.createForClass(SkillModel);

SkillSchema.index(
  { ownerId: 1, partition: 1, slug: 1 },
  { sparse: true, unique: true }
);
