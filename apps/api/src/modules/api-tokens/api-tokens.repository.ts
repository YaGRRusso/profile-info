import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { ApiTokenModel } from "./schemas/api-token.schema";

@Injectable()
export class ApiTokensRepository extends CrudRepository<ApiTokenModel> {
  readonly tenant: TenantScopedCrudRepository<ApiTokenModel>;

  constructor(
    @InjectModel(ApiTokenModel.name) apiTokenModel: Model<ApiTokenModel>
  ) {
    super(apiTokenModel);
    this.tenant = new TenantScopedCrudRepository(this);
  }
}
