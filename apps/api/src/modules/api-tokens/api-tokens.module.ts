import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "@/modules/users/users.module";
import { ApiTokenValidationService } from "./api-token-validation.service";
import { ApiTokensRepository } from "./api-tokens.repository";
import { ApiTokensResolver } from "./api-tokens.resolver";
import { ApiTokensService } from "./api-tokens.service";
import { ApiTokenModel, ApiTokenSchema } from "./schemas/api-token.schema";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: ApiTokenModel.name, schema: ApiTokenSchema },
    ]),
  ],
  providers: [
    ApiTokensRepository,
    ApiTokenValidationService,
    ApiTokensResolver,
    ApiTokensService,
  ],
  exports: [ApiTokensService, ApiTokenValidationService],
})
export class ApiTokensModule {}
