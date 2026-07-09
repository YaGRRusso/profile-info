import { cleanTestCache } from "../support/clean-test-cache";

export default async function globalTeardown() {
  await globalThis.__MONGOD__?.stop();
  cleanTestCache();
}
