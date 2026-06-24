import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ApiTokenModel,
  ApiTokenSchema,
} from "@/modules/api-tokens/schemas/api-token.schema";
import { ApiTokensRepository } from "./api-tokens.repository";
import { ApiTokensResolver } from "./api-tokens.resolver";
import { ApiTokensService } from "./api-tokens.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApiTokenModel.name, schema: ApiTokenSchema },
    ]),
  ],
  providers: [ApiTokensRepository, ApiTokensResolver, ApiTokensService],
  exports: [ApiTokensService],
})
export class ApiTokensModule {}
