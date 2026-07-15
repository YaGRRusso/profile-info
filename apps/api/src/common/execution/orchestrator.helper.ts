import pLimit from "p-limit";
import { TtlMemoryCache } from "@/common/cache/ttl-memory-cache";

const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new TtlMemoryCache<unknown>(DEFAULT_CACHE_TTL_MS);

interface OrchestratorOptions<T> {
  cacheKey?: (item: T) => string;
  concurrency?: number;
  timeoutMs?: number;
}

export async function orchestrate<T, R>(
  items: T[],
  taskFn: (item: T) => Promise<R[]>,
  options: OrchestratorOptions<T> = {}
): Promise<R[]> {
  const { cacheKey, concurrency = 5, timeoutMs = 30_000 } = options;
  const limit = pLimit(concurrency);

  const promises = items.map((item) =>
    limit(async () => {
      try {
        if (cacheKey) {
          const key = cacheKey(item);
          const hit = cache.get(key);
          if (Array.isArray(hit)) return hit;

          const result = await taskFn(item);
          cache.set(key, result);
          return result;
        }

        return await taskFn(item);
      } catch (error) {
        console.error("[Orchestrator] Failed Process:", error);
        return [];
      }
    })
  );

  if (promises.length === 0) return [];

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Orchestration Timeout")), timeoutMs)
  );

  const results = await Promise.race([Promise.all(promises), timeoutPromise]);

  return results.flat();
}
