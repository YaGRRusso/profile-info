import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import type { ApiTokenEntity } from "./entities/api-token.entity";
import { toApiTokenEntity } from "./mappers/api-token.mapper";
import { ApiTokenModel } from "./schemas/api-token.schema";

@Injectable()
export class ApiTokensRepository extends CrudRepository<
  ApiTokenModel,
  ApiTokenEntity
> {
  readonly tenant: TenantScopedCrudRepository<ApiTokenModel, ApiTokenEntity>;

  constructor(@InjectModel(ApiTokenModel.name) model: Model<ApiTokenModel>) {
    super(model);
    this.tenant = new TenantScopedCrudRepository(this);
  }

  protected toEntity(model: ApiTokenModel): ApiTokenEntity {
    return toApiTokenEntity(model);
  }
}
