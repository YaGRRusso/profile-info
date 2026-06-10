import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./core/configs/env.validation";
import { PersistenceExceptionFilter } from "./core/filters/persistence-exception.filter";
import { HealthModule } from "./core/health/health.module";
import { AiToolsModule } from "./modules/ai-tools/ai-tools.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { EducationsModule } from "./modules/educations/educations.module";
import { ExperiencesModule } from "./modules/experiences/experiences.module";
import { GraphqlModule } from "./modules/graphql/graphql.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { SkillsModule } from "./modules/skills/skills.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get("DATABASE_URL");
        if (!uri) throw new Error("DATABASE_URL not defined");

        return {
          uri,
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        };
      },
    }),
    GraphqlModule,
    HealthModule,
    AuthModule,
    SkillsModule,
    OrganizationsModule,
    UsersModule,
    ExperiencesModule,
    EducationsModule,
    CoursesModule,
    ProjectsModule,
    DashboardModule,
    AiToolsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: PersistenceExceptionFilter },
  ],
})
export class AppModule {}
