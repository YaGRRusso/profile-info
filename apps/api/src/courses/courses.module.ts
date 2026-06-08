import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CourseModel, CourseSchema } from "@/schemas/course.schema";
import { CoursesResolver } from "./courses.resolver";
import { CoursesService } from "./courses.service";
import { OnOrganizationDeletedListener } from "./listeners/on-organization-deleted.listener";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseModel.name, schema: CourseSchema },
    ]),
  ],
  providers: [
    CoursesResolver,
    CoursesService,
    OnSkillDeletedListener,
    OnOrganizationDeletedListener,
  ],
})
export class CoursesModule {}
