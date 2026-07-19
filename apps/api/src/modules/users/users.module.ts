import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CoursesModule } from "@/modules/courses/courses.module";
import { EducationsModule } from "@/modules/educations/educations.module";
import { ExperiencesModule } from "@/modules/experiences/experiences.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { SkillsModule } from "@/modules/skills/skills.module";
import { UserModel, UserSchema } from "@/modules/users/schemas/user.schema";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";
import { UsersRepository } from "./users.repository";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";
import { UsersLoaderService } from "./users-loader.service";
import { UsersValidatorService } from "./users-validator.service";

@Module({
  exports: [UsersService, UsersLoaderService, UsersValidatorService],
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    SkillsModule,
    ExperiencesModule,
    EducationsModule,
    CoursesModule,
    ProjectsModule,
  ],
  providers: [
    UsersRepository,
    UsersResolver,
    UsersService,
    UsersLoaderService,
    UsersValidatorService,
    OnSkillDeletedListener,
  ],
})
export class UsersModule {}
