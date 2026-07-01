import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import type { Env } from "@/core/configs/env.validation";
import { ApiTokensModule } from "@/modules/api-tokens/api-tokens.module";
import { UsersModule } from "@/modules/users/users.module";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { GqlAuthenticationGuard } from "./guards/gql-authentication.guard";
import { GqlAuthorizationGuard } from "./guards/gql-authorization.guard";
import { ApiTokenStrategy } from "./strategies/api-token.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    UsersModule,
    ApiTokensModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.getOrThrow("JWT_SECRET"),
        signOptions: { expiresIn: "8h" },
      }),
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    ApiTokenStrategy,
    { provide: APP_GUARD, useClass: GqlAuthenticationGuard },
    { provide: APP_GUARD, useClass: GqlAuthorizationGuard },
  ],
})
export class AuthModule {}
