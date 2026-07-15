import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Test, TestingModule } from "@nestjs/testing";
import { OrchestratorService } from "./orchestrator.service";

describe("OrchestratorService", () => {
  let service: OrchestratorService;
  let store: Map<string, unknown>;
  let cache: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    store = new Map();
    cache = {
      get: jest.fn((key: string) => Promise.resolve(store.get(key))),
      set: jest.fn((key: string, value: unknown) => {
        store.set(key, value);
        return Promise.resolve();
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrchestratorService,
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get(OrchestratorService);
  });

  it("returns an empty list when there are no items", async () => {
    const execute = jest.fn();

    await expect(service.run([], execute)).resolves.toEqual([]);
    expect(execute).not.toHaveBeenCalled();
  });

  it("runs each item and flattens the batches", async () => {
    const execute = jest.fn((n: number) =>
      Promise.resolve([`${n}-a`, `${n}-b`])
    );

    await expect(service.run([1, 2], execute)).resolves.toEqual([
      "1-a",
      "1-b",
      "2-a",
      "2-b",
    ]);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it("turns a failed item into [] and keeps other results", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation();
    const execute = jest.fn((n: number) => {
      if (n === 2) return Promise.reject(new Error("boom"));
      return Promise.resolve([`ok-${n}`]);
    });

    await expect(service.run([1, 2, 3], execute)).resolves.toEqual([
      "ok-1",
      "ok-3",
    ]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("stores results under cacheKey and reuses them on the next run", async () => {
    const execute = jest.fn((id: string) => Promise.resolve([`result-${id}`]));
    const options = { cacheKey: (id: string) => `item:${id}` };

    await expect(service.run(["a"], execute, options)).resolves.toEqual([
      "result-a",
    ]);
    await expect(service.run(["a"], execute, options)).resolves.toEqual([
      "result-a",
    ]);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledWith("item:a", ["result-a"]);
    expect(cache.get).toHaveBeenCalledWith("item:a");
  });

  it("shares one in-flight compute when several items share a cache key", async () => {
    let release: ((value: string[]) => void) | undefined;
    const execute = jest.fn(
      () =>
        new Promise<string[]>((resolve) => {
          release = resolve;
        })
    );

    const running = service.run(["x", "y"], execute, {
      cacheKey: () => "shared",
      timeoutMs: 5000,
    });

    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(release).toBeDefined();

    release?.(["once"]);
    await expect(running).resolves.toEqual(["once", "once"]);
  });

  it("rejects when the overall timeout is exceeded", async () => {
    jest.useFakeTimers();

    try {
      const execute = jest.fn(() => new Promise<string[]>(() => undefined));
      const running = service.run(["slow"], execute, { timeoutMs: 1000 });

      const expectation = expect(running).rejects.toThrow(
        "Orchestration Timeout"
      );
      await jest.advanceTimersByTimeAsync(1000);
      await expectation;
    } finally {
      jest.useRealTimers();
    }
  });
});
