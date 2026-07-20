import { Controller, Get, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "@/core/configs/env.validation";

@Controller()
export class SentryController {
  constructor(private readonly config: ConfigService<Env, true>) {}

  @Get("sentry-test")
  smokeTest(): never {
    if (this.config.getOrThrow("NODE_ENV") !== "production") {
      throw new NotFoundException();
    }

    throw new Error("Sentry Smoke Test");
  }
}
