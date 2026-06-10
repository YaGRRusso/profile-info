import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModel, UserSchema } from "@/modules/users/schemas/user.schema";
import { UsersRepository } from "./users.repository";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  providers: [UsersRepository, UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
