import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { FilterApiTokenInput } from "./dto/filter-api-token.input";
import { SortApiTokenInput } from "./dto/sort-api-token.input";
import { UpdateApiTokenInput } from "./dto/update-api-token.input";
import type { ApiTokenEntity } from "./entities/api-token.entity";
import {
  type ApiTokenCreateRecord,
  ApiTokenMapper,
} from "./mappers/api-token.mapper";
import { ApiTokenModel } from "./schemas/api-token.schema";

@Injectable()
export class ApiTokensRepository {
  readonly crud: CrudRepository<
    ApiTokenModel,
    ApiTokenEntity,
    ApiTokenCreateRecord,
    UpdateApiTokenInput,
    FilterApiTokenInput,
    SortApiTokenInput
  >;

  constructor(@InjectModel(ApiTokenModel.name) model: Model<ApiTokenModel>) {
    this.crud = new CrudRepository(model, new ApiTokenMapper());
  }
}
