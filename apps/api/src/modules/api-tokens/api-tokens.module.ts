import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "@/modules/users/users.module";
import { ApiTokensRepository } from "./api-tokens.repository";
import { ApiTokensResolver } from "./api-tokens.resolver";
import { ApiTokensService } from "./api-tokens.service";
import { OnUserDeletedListener } from "./listeners/on-user-deleted.listener";
import { ApiTokenModel, ApiTokenSchema } from "./schemas/api-token.schema";

@Module({
  exports: [ApiTokensService],
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: ApiTokenModel.name, schema: ApiTokenSchema },
    ]),
  ],
  providers: [
    ApiTokensRepository,
    ApiTokensResolver,
    ApiTokensService,
    OnUserDeletedListener,
  ],
})
export class ApiTokensModule {}
