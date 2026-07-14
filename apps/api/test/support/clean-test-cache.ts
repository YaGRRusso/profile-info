import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const cacheRoot = path.join(process.cwd(), ".cache");

const removableCacheEntries = ["mongodb-data", "test-mongo.json"] as const;

export function cleanTestCache(): void {
  for (const entry of removableCacheEntries) {
    const target = path.join(cacheRoot, entry);
    if (!existsSync(target)) continue;
    rmSync(target, { force: true, recursive: true });
  }
}
