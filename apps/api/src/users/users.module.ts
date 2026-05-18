import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModel, UserSchema } from "@/schemas/user.schema";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
