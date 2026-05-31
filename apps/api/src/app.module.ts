import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { createLoaders } from "./core/helpers/loaders.helper";
import { CoursesModule } from "./courses/courses.module";
import { EducationsModule } from "./educations/educations.module";
import { ExperiencesModule } from "./experiences/experiences.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { OrganizationsService } from "./organizations/organizations.service";
import { ProjectsModule } from "./projects/projects.module";
import { SkillsModule } from "./skills/skills.module";
import { SkillsService } from "./skills/skills.service";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
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
    SkillsModule,
    ProjectsModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    EducationsModule,
    ExperiencesModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
