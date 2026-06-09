import { stopTestMongo } from "../support/mongo-memory";

export default async function globalTeardown() {
  await stopTestMongo();
}
