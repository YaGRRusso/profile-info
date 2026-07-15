/** Process-local TTL cache. Lost on restart; not shared across instances. */
export class TtlMemoryCache<V> {
  private readonly store = new Map<string, { expiresAt: number; value: V }>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return;
    }

    return entry.value;
  }

  set(key: string, value: V): void {
    this.store.set(key, {
      expiresAt: Date.now() + this.ttlMs,
      value,
    });
  }
}
