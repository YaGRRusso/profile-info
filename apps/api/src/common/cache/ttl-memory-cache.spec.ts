import { TtlMemoryCache } from "./ttl-memory-cache";

describe("TtlMemoryCache", () => {
  it("returns set values until expiry", () => {
    const cache = new TtlMemoryCache<string>(60_000);
    cache.set("a", "one");
    expect(cache.get("a")).toBe("one");
    expect(cache.get("missing")).toBeUndefined();
  });

  it("expires entries after ttl", () => {
    jest.useFakeTimers();
    const cache = new TtlMemoryCache<string>(1000);
    cache.set("a", "one");
    jest.advanceTimersByTime(1001);
    expect(cache.get("a")).toBeUndefined();
    jest.useRealTimers();
  });
});
