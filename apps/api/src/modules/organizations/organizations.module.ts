import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  OrganizationModel,
  OrganizationSchema,
} from "@/modules/organizations/schemas/organization.schema";
import { OrganizationsRepository } from "./organizations.repository";
import { OrganizationsResolver } from "./organizations.resolver";
import { OrganizationsService } from "./organizations.service";
import { OrganizationsLoaderService } from "./organizations-loader.service";
import { OrganizationsValidatorService } from "./organizations-validator.service";

@Module({
  exports: [
    OrganizationsService,
    OrganizationsLoaderService,
    OrganizationsValidatorService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationModel.name, schema: OrganizationSchema },
    ]),
  ],
  providers: [
    OrganizationsRepository,
    OrganizationsResolver,
    OrganizationsService,
    OrganizationsLoaderService,
    OrganizationsValidatorService,
  ],
})
export class OrganizationsModule {}
