import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SkillsModule } from "@/modules/skills/skills.module";
import { UserModel, UserSchema } from "@/modules/users/schemas/user.schema";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";
import { UsersRepository } from "./users.repository";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";
import { UsersLoaderService } from "./users-loader.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    SkillsModule,
  ],
  providers: [
    UsersRepository,
    UsersResolver,
    UsersService,
    UsersLoaderService,
    OnSkillDeletedListener,
  ],
  exports: [UsersService, UsersLoaderService],
})
export class UsersModule {}
