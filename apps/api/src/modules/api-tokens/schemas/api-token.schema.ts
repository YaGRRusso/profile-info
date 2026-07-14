import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { BaseModel } from "@/core/schemas/base.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";

@Schema({ timestamps: true })
export class ApiTokenModel extends BaseModel {
  @Prop({
    index: true,
    ref: UserModel.name,
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  ownerId: mongoose.Types.ObjectId | string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, select: false, type: String })
  hashedSecret: string;

  @Prop({
    enum: ["QUERY", "MUTATE"],
    required: true,
    type: [String],
  })
  permissions: ApiTokenPermission[];

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const ApiTokenSchema = SchemaFactory.createForClass(ApiTokenModel);
