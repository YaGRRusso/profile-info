import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  CourseModel,
  CourseSchema,
} from "@/modules/courses/schemas/course.schema";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { SkillsModule } from "@/modules/skills/skills.module";
import { CoursesRepository } from "./courses.repository";
import { CoursesResolver } from "./courses.resolver";
import { CoursesService } from "./courses.service";
import { OnOrganizationDeletedListener } from "./listeners/on-organization-deleted.listener";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";
import { OnUserDeletedListener } from "./listeners/on-user-deleted.listener";

@Module({
  exports: [CoursesService],
  imports: [
    OrganizationsModule,
    SkillsModule,
    MongooseModule.forFeature([
      { name: CourseModel.name, schema: CourseSchema },
    ]),
  ],
  providers: [
    CoursesRepository,
    CoursesResolver,
    CoursesService,
    OnSkillDeletedListener,
    OnOrganizationDeletedListener,
    OnUserDeletedListener,
  ],
})
export class CoursesModule {}
