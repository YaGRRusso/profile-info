import DataLoader from "dataloader";

export interface KeyedLoader<V> {
  forKey: (key: string) => DataLoader<string, V | null>;
}

export function createKeyedLoaderCache<V>(
  createLoader: (key: string) => DataLoader<string, V | null>
): KeyedLoader<V> {
  const cache = new Map<string, DataLoader<string, V | null>>();

  return {
    forKey(key: string) {
      let loader = cache.get(key);
      if (!loader) {
        loader = createLoader(key);
        cache.set(key, loader);
      }
      return loader;
    },
  };
}
