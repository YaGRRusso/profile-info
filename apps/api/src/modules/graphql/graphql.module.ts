import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import type { GraphQLFormattedError } from "graphql";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import { SkillsModule } from "@/modules/skills/skills.module";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";
import { LoadersService } from "./loaders.service";

@Module({
  imports: [
    SkillsModule,
    OrganizationsModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, SkillsModule, OrganizationsModule],
      inject: [ConfigService, SkillsLoaderService, OrganizationsLoaderService],
      useFactory: (
        config: ConfigService,
        skillsLoaderService: SkillsLoaderService,
        organizationsLoaderService: OrganizationsLoaderService
      ) => ({
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        autoSchemaFile:
          config.get("NODE_ENV") === "test"
            ? true
            : join(process.cwd(), "src/schema.gql"),
        introspection: config.get("NODE_ENV") !== "production",
        sortSchema: true,
        playground: false,
        formatError: (
          formattedError: GraphQLFormattedError
        ): GraphQLFormattedError => {
          if (config.get("NODE_ENV") === "production") {
            const { stacktrace: _stacktrace, ...extensions } =
              formattedError.extensions ?? {};
            return { ...formattedError, extensions };
          }

          return formattedError;
        },
        context: ({ req, res }) => ({
          loaders: new LoadersService(
            skillsLoaderService,
            organizationsLoaderService
          ).createLoaders(),
          req,
          res,
        }),
      }),
    }),
  ],
})
export class GraphqlModule {}
