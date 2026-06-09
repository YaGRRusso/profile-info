import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GraphQLModule } from "@nestjs/graphql";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AiToolsModule } from "./modules/ai-tools/ai-tools.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { EducationsModule } from "./modules/educations/educations.module";
import { ExperiencesModule } from "./modules/experiences/experiences.module";
import { createLoaders } from "./modules/graphql/loaders.helper";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { OrganizationsService } from "./modules/organizations/organizations.service";
import { ProjectsModule } from "./modules/projects/projects.module";
import { SkillsModule } from "./modules/skills/skills.module";
import { SkillsService } from "./modules/skills/skills.service";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>("DATABASE_URL");
        if (!uri) throw new Error("DATABASE_URL not defined");

        return {
          uri,
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        };
      },
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [SkillsModule, OrganizationsModule],
      inject: [SkillsService, OrganizationsService],
      useFactory: (
        skillsService: SkillsService,
        organizationsService: OrganizationsService
      ) => ({
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        introspection: true,
        sortSchema: true,
        playground: false,
        context: ({ req, res }) => ({
          loaders: createLoaders({ skillsService, organizationsService }),
          req,
          res,
        }),
      }),
    }),
    AiToolsModule,
    SkillsModule,
    ProjectsModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    DashboardModule,
    EducationsModule,
    ExperiencesModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
