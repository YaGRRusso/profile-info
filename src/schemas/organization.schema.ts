import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";

@Schema({ timestamps: true })
export class OrganizationModel extends BaseModel {
  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  website: string;

  @Prop({ type: String, required: true })
  logo: string;

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
