import { Injectable, InternalServerErrorException } from "@nestjs/common";
import pLimit from "p-limit";

interface OrchestratorOptions {
  concurrency?: number;
  timeoutMs?: number;
}

@Injectable()
export class OrchestratorService {
  async execute<T, R>(
    items: T[],
    taskFn: (item: T) => Promise<R[]>,
    options: OrchestratorOptions = {}
  ): Promise<R[]> {
    const { concurrency = 5, timeoutMs = 30_000 } = options;
    const limit = pLimit(concurrency);

    const promises = items.map((item) =>
      limit(async () => {
        try {
          return await taskFn(item);
        } catch (error) {
          console.error("[Orchestrator] Failed Process:", error);
          return [] as R[];
        }
      })
    );

    if (promises.length === 0) return [];

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Orchestration Timeout")), timeoutMs)
      );

      const results = await Promise.race([
        Promise.all(promises),
        timeoutPromise,
      ]);

      return results.flat();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
