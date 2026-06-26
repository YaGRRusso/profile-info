import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import type { ApiTokenEntity } from "./entities/api-token.entity";
import { toApiTokenEntity } from "./mappers/api-token.mapper";
import { ApiTokenModel } from "./schemas/api-token.schema";

@Injectable()
export class ApiTokensRepository {
  readonly crud: CrudRepository<ApiTokenModel, ApiTokenEntity>;

  constructor(@InjectModel(ApiTokenModel.name) model: Model<ApiTokenModel>) {
    this.crud = new CrudRepository(model, toApiTokenEntity);
  }
}
