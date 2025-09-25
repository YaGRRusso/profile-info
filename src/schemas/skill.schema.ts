import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class SkillModel {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String })
  slug?: string;
}

export type SkillDocument = HydratedDocument<SkillModel>;
export const SkillSchema = SchemaFactory.createForClass(SkillModel);
