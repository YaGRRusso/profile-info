import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { createLoaders } from "./core/helpers/loaders.helper";
import { ProjectsModule } from "./projects/projects.module";
import { SkillsModule } from "./skills/skills.module";
import { SkillsService } from "./skills/skills.service";

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
      imports: [SkillsModule],
      inject: [SkillsService],
      useFactory: (skillsService: SkillsService) => ({
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        sortSchema: true,
        playground: false,
        context: () => ({
          loaders: createLoaders({ skillsService }),
        }),
      }),
    }),
    SkillsModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
