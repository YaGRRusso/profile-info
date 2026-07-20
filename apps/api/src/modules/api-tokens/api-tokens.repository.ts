import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { Model } from "mongoose";
import { tenantPersistenceScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { i18nKey } from "@/core/i18n/i18n";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { FilterApiTokenInput } from "./dto/filter-api-token.input";
import { SortApiTokenInput } from "./dto/sort-api-token.input";
import { UpdateApiTokenInput } from "./dto/update-api-token.input";
import type { ApiTokenEntityRecord } from "./entities/api-token.entity";
import { ApiTokenWithHashedEntity } from "./entities/api-token-with-hashed.entity";
import {
  type ApiTokenCreateRecord,
  ApiTokenMapper,
} from "./mappers/api-token.mapper";
import { ApiTokenModel } from "./schemas/api-token.schema";

@Injectable()
export class ApiTokensRepository {
  private readonly mapper = new ApiTokenMapper();
  readonly crud: CrudRepository<
    ApiTokenModel,
    ApiTokenEntityRecord,
    ApiTokenCreateRecord,
    UpdateApiTokenInput,
    FilterApiTokenInput,
    SortApiTokenInput
  >;

  constructor(
    @InjectModel(ApiTokenModel.name)
    private readonly model: Model<ApiTokenModel>
  ) {
    this.crud = new CrudRepository(model, this.mapper);
  }

  tenantCrud(ctx: AuthContext) {
    return this.crud.scoped(tenantPersistenceScope(ctx));
  }

  async findOneByIdWithHashedSecret(
    id: string
  ): Promise<ApiTokenWithHashedEntity> {
    const document = await this.model
      .findById(id)
      .select("+hashedSecret ownerId permissions expiresAt")
      .lean();

    if (!document && isNil(document))
      throw new NotFoundException(
        i18nKey("persistence.NOT_FOUND_BY_ID", {
          id,
          resource: "ApiToken",
        })
      );

    return {
      ...this.mapper.toDomain(document),
      hashedSecret: String(document.hashedSecret),
      ownerId: String(document.ownerId),
    };
  }

  async purgeByOwner(ownerId: string): Promise<void> {
    await this.model.deleteMany({ ownerId }).exec();
  }
}
