import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { OrganizationModel } from "./schemas/organization.schema";

@Injectable()
export class OrganizationsRepository extends MongooseCrudRepository<OrganizationModel> {
  constructor(
    @InjectModel(OrganizationModel.name)
    organizationModel: Model<OrganizationModel>
  ) {
    super(organizationModel);
  }
}
