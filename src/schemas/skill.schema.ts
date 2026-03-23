import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";
import { BaseModel } from "@/core/schemas/base.schema";

@Schema({ timestamps: true })
export class SkillModel extends BaseModel {
  @Prop({ type: Number })
  relevance?: number;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: String,
    required: true,
    enum: [
      "LANGUAGE",
      "FRONTEND",
      "BACKEND",
      "DATA",
      "DEVOPS",
      "QUALITY",
      "DESIGN",
      "CONCEPTS",
      "SOFT",
    ],
    index: true,
  })
  category: string;
}

export type SkillDocument = HydratedDocument<SkillModel>;
export const SkillSchema = SchemaFactory.createForClass(SkillModel);
