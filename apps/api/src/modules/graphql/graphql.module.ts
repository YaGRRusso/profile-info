import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { OrganizationsLoaderService } from "@/modules/organizations/organizations-loader.service";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { SkillsLoaderService } from "@/modules/skills/skills-loader.service";
import { SkillsModule } from "@/modules/skills/skills.module";
import { LoadersService } from "./loaders.service";

@Module({
  imports: [
    SkillsModule,
    OrganizationsModule,
    GraphQLModule.forRootAsync({
        driver: ApolloDriver,
      imports: [SkillsModule, OrganizationsModule],
      inject: [SkillsLoaderService, OrganizationsLoaderService],
      useFactory: (
        skillsLoaderService: SkillsLoaderService,
        organizationsLoaderService: OrganizationsLoaderService
      ) => ({
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        introspection: true,
        sortSchema: true,
        playground: false,
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
