import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import type { GraphQLFormattedError } from "graphql";
import type { Env } from "@/core/configs/env.validation";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import { SkillsModule } from "@/modules/skills/skills.module";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";
import { UsersModule } from "@/modules/users/users.module";
import { UsersLoaderService } from "@/modules/users/users-loader.service";
import { LoadersService } from "./loaders.service";
import "./loaders.registry";

@Module({
  imports: [
    SkillsModule,
    OrganizationsModule,
    UsersModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, SkillsModule, OrganizationsModule, UsersModule],
      inject: [
        ConfigService,
        SkillsLoaderService,
        OrganizationsLoaderService,
        UsersLoaderService,
      ],
      useFactory: (
        config: ConfigService<Env, true>,
        skillsLoaderService: SkillsLoaderService,
        organizationsLoaderService: OrganizationsLoaderService,
        usersLoaderService: UsersLoaderService
      ) => {
        const nodeEnv = config.getOrThrow("NODE_ENV");

        return {
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          autoSchemaFile:
            nodeEnv === "test" ? true : join(process.cwd(), "src/schema.gql"),
          introspection: config.getOrThrow("GRAPHQL_INTROSPECTION"),
          sortSchema: true,
          playground: false,
          formatError: (
            formattedError: GraphQLFormattedError
          ): GraphQLFormattedError => {
            if (nodeEnv === "production") {
              const { stacktrace: _stacktrace, ...extensions } =
                formattedError.extensions ?? {};
              return { ...formattedError, extensions };
            }

            return formattedError;
          },
          context: ({ req, res }) => ({
            loaders: new LoadersService(
              skillsLoaderService,
              organizationsLoaderService,
              usersLoaderService
            ).createLoaders(req),
            req,
            res,
          }),
        };
      },
    }),
  ],
})
export class GraphqlModule {}
