import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { createKeyv } from "cacheable";
import { OrchestratorService } from "@/core/execution/orchestrator.service";

const TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Global Nest cache (TTL + LRU) + OrchestratorService.
 * Swap `stores` for Redis later without changing callers.
 */
@Global()
@Module({
  exports: [OrchestratorService],
  imports: [
    CacheModule.register({
      isGlobal: true,
      stores: [createKeyv({ lruSize: 500, ttl: TTL_MS })],
      ttl: TTL_MS,
    }),
  ],
  providers: [OrchestratorService],
})
export class AppCacheModule {}
