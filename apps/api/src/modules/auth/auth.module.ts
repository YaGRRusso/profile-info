import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "@/modules/users/users.module";
import { GqlAuthGuard } from "./auth.guard";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { AuthStrategy } from "./auth.strategy";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get("JWT_SECRET");
        if (!secret)
          throw new Error("JWT_SECRET environment variable is not defined");

        return {
          secret,
          signOptions: { expiresIn: "8h" },
        };
      },
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    AuthStrategy,
    { provide: APP_GUARD, useClass: GqlAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
