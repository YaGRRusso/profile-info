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
  @Prop({ required: true, type: String })
  description: string;
}

@Schema({ timestamps: true })
export class OrganizationModel extends BaseModel {
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

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String })
  website?: string;

  @Prop({ type: String })
  logo?: string;

  @Prop({
    required: true,
    type: [createTranslationModel(OrganizationMessagesModel)],
  })
  i18n: TranslationModel<OrganizationMessagesModel>[];

  @Prop({
    enum: ["COMPANY", "SCHOOL", "OTHER"],
    index: true,
    required: true,
    type: String,
  })
  category: string;
}

export const OrganizationSchema =
  SchemaFactory.createForClass(OrganizationModel);

OrganizationSchema.index(
  { ownerId: 1, partition: 1, slug: 1 },
  { sparse: true, unique: true }
);
