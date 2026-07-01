import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseModel } from "@/core/schemas/base.schema";

@Schema({ timestamps: true })
export class SkillModel extends BaseModel {
  @Prop({ type: Number, required: true, default: 0 })
  relevance: number;

  @Prop({ type: Boolean, required: true, default: false, index: true })
  disabled: boolean;

  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: String,
    required: true,
    enum: ["LANGUAGE", "FRONTEND", "BACKEND", "DATA", "DEVOPS"],
    index: true,
  })
  category: string;
}

export const SkillSchema = SchemaFactory.createForClass(SkillModel);

// SkillSchema.index(
//   { slug: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       $or: [{ disabled: false }, { disabled: { $exists: false } }],
//     },
//   }
// );
