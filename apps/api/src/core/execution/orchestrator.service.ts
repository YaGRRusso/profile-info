import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import pLimit from "p-limit";

const DEFAULT_CONCURRENCY = 5;
const DEFAULT_TIMEOUT_MS = 30_000;

interface OrchestratorRunOptions<T> {
  cacheKey?: (item: T) => string;
  concurrency?: number;
  timeoutMs?: number;
}

@Injectable()
export class OrchestratorService {
  private readonly sharedRequestsByKey = new Map<string, Promise<unknown>>();

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async run<T, R>(
    items: T[],
    execute: (item: T) => Promise<R[]>,
    options: OrchestratorRunOptions<T> = {}
  ): Promise<R[]> {
    if (items.length === 0) return [];

    const {
      cacheKey,
      concurrency = DEFAULT_CONCURRENCY,
      timeoutMs = DEFAULT_TIMEOUT_MS,
    } = options;

    const limit = pLimit(concurrency);

    const work = Promise.all(
      items.map((item) =>
        limit(async () => {
          try {
            if (!cacheKey) return await execute(item);
            return await this.getOrCompute(cacheKey(item), () => execute(item));
          } catch (error) {
            console.error("[Orchestrator] Failed Process:", error);
            return [];
          }
        })
      )
    );

    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Orchestration Timeout")), timeoutMs);
    });

    const batches = await Promise.race([work, timeout]);
    return batches.flat();
  }

  private async getOrCompute<R>(
    key: string,
    compute: () => Promise<R[]>
  ): Promise<R[]> {
    const cached = await this.cache.get(key);
    if (Array.isArray(cached)) return cached;

    const inFlight = this.sharedRequestsByKey.get(key);
    if (inFlight) {
      const shared = await inFlight;
      return Array.isArray(shared) ? shared : [];
    }

    const request = Promise.resolve()
      .then(() => compute())
      .then(async (results) => {
        await this.cache.set(key, results);
        return results;
      })
      .finally(() => {
        this.sharedRequestsByKey.delete(key);
      });

    this.sharedRequestsByKey.set(key, request);
    return request;
  }
}
