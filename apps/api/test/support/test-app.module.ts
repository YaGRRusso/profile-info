import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { ApiTokensModule } from "@/modules/api-tokens/api-tokens.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { CoursesModule } from "@/modules/courses/courses.module";
import { DashboardModule } from "@/modules/dashboard/dashboard.module";
import { EducationsModule } from "@/modules/educations/educations.module";
import { ExperiencesModule } from "@/modules/experiences/experiences.module";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { ResumeModule } from "@/modules/resume/resume.module";
import { SkillsModule } from "@/modules/skills/skills.module";
import { UsersModule } from "@/modules/users/users.module";
import { GraphqlModule } from "@/platform/graphql/graphql.module";

@Module({
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow("DATABASE_URL"),
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      }),
    }),
    GraphqlModule,
    AuthModule,
    ApiTokensModule,
    SkillsModule,
    OrganizationsModule,
    UsersModule,
    ExperiencesModule,
    EducationsModule,
    CoursesModule,
    ProjectsModule,
    DashboardModule,
    ResumeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {}
