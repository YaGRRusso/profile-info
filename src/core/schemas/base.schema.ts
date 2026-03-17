import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false })
export class BaseModel {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  updatedAt: Date;
}
