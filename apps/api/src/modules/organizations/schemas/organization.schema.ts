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
export class OrganizationMessagesModel {
  @Prop({ type: String, required: true })
  description: string;
}

@Schema({ timestamps: true })
export class OrganizationModel extends BaseModel {
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

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  website?: string;

  @Prop({ type: String })
  logo?: string;

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

export const OrganizationSchema =
  SchemaFactory.createForClass(OrganizationModel);

OrganizationSchema.index(
  { partition: 1, ownerId: 1, slug: 1 },
  { unique: true, sparse: true }
);
