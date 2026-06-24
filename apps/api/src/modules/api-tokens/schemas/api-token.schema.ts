import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { BaseModel } from "@/core/schemas/base.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";

@Schema({ timestamps: true })
export class ApiTokenModel extends BaseModel {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
    required: true,
    index: true,
  })
  ownerId: mongoose.Types.ObjectId | string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, select: false })
  hashedSecret: string;

  @Prop({
    type: [String],
    required: true,
    enum: ["QUERY", "MUTATE"],
  })
  permissions: ApiTokenPermission[];

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const ApiTokenSchema = SchemaFactory.createForClass(ApiTokenModel);
