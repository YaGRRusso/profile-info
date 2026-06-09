import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillsModule } from "@/modules/skills/skills.module";
import { SkillsService } from "@/modules/skills/skills.service";
import { createLoaders } from "./loaders.helper";

@Module({
  imports: [
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
  ],
})
export class GraphqlModule {}
