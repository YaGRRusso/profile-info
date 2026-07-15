import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { AppCacheModule } from "@/core/cache/app-cache.module";
import { PersistenceExceptionFilter } from "@/core/filters/persistence-exception.filter";
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
  controllers: [AppController],
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    AppCacheModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connectTimeoutMS: 3000,
        serverSelectionTimeoutMS: 3000,
        uri: config.getOrThrow("DATABASE_URL"),
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
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: PersistenceExceptionFilter },
  ],
})
export class TestAppModule {}
