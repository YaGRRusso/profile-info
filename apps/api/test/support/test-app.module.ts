import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { AuthModule } from "@/modules/auth/auth.module";
import { CoursesModule } from "@/modules/courses/courses.module";
import { DashboardModule } from "@/modules/dashboard/dashboard.module";
import { EducationsModule } from "@/modules/educations/educations.module";
import { ExperiencesModule } from "@/modules/experiences/experiences.module";
import { GraphqlModule } from "@/modules/graphql/graphql.module";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { SkillsModule } from "@/modules/skills/skills.module";
import { UsersModule } from "@/modules/users/users.module";

@Module({
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
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
    AuthModule,
    SkillsModule,
    OrganizationsModule,
    UsersModule,
    ExperiencesModule,
    EducationsModule,
    CoursesModule,
    ProjectsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {}
