import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  OrganizationModel,
  OrganizationSchema,
} from "@/schemas/organization.schema";
import { OrganizationsResolver } from "./organizations.resolver";
import { OrganizationsService } from "./organizations.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationModel.name, schema: OrganizationSchema },
    ]),
  ],
  providers: [OrganizationsResolver, OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
