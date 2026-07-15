# API tests

This folder holds **e2e** and **integration** tests. **Unit tests** live next to source code (`src/**/*.spec.ts`) and use a separate Jest config (see `package.json` → `"jest"`).

```bash
# From apps/api/
npm run test       # unit tests (src/**/*.spec.ts)
npm run test:e2e   # e2e + integration (this folder)
```

---

## Folder layout

```
test/
├── config/           # Jest wiring (lifecycle hooks, env)
├── e2e/              # HTTP / GraphQL tests (*.spec.ts)
├── fixtures/         # test data builders (import via @test/fixtures/…)
├── seed/             # seed contract tests (import via @seed/…)
├── integration/      # service-level tests (*.spec.ts)
└── support/          # Nest bootstrap, DB, HTTP helpers (e2e/integration only)
```

| Path | Role |
|------|------|
| `fixtures/` | E2e helpers: `signInPersona`, `createTenantUsers` (`@test/fixtures/…`). Credentials match dev seed via `@seed/constants` and `@seed/personas`. |
| `config/jest-e2e.json` | Jest config **only** for e2e/integration |
| `config/global-setup.ts` | Runs once before all suites (Mongo in-memory, cache cleanup) |
| `config/global-teardown.ts` | Runs once after all suites (stop Mongo, cache cleanup) |
| `config/setup-env.ts` | Runs before **each** test file; sets `process.env` |
| `support/create-test-app.ts` | Bootstraps a Nest app via `TestAppModule` |
| `support/test-app.module.ts` | Slim app module for tests (no AI tools, in-memory GraphQL schema) |
| `support/test-env.ts` | Fake secrets and `NODE_ENV=test` |
| `support/clear-test-database.ts` | `dropDatabase()` between suites when needed |
| `support/graphql-request.ts` | Helper for GraphQL HTTP calls |

### Import aliases

| Alias | Maps to | Use in |
|-------|---------|--------|
| `@/*` | `src/*` | Production code and tests |
| `@seed/*` | `seed/*` | Dev seed scripts (excluded from Nest build) |
| `@test/*` | `test/*` | Tests only — fixtures and (from e2e) support helpers |

Unit specs under `src/**/*.spec.ts` and `test/seed/**/*.spec.ts` import seed builders
from `@seed/…`. E2e/integration use `@test/fixtures/…` for sign-in and tenant setup.

---

## Two Jest configs (why it feels confusing)

Jest is configured **twice** on purpose:

| | Unit tests | E2e / integration |
|---|------------|-------------------|
| Config | `package.json` → `"jest"` | `test/config/jest-e2e.json` |
| Command | `npm run test` | `npm run test:e2e` |
| Files | `src/**/*.spec.ts`, `test/seed/**/*.spec.ts` | `test/e2e/**`, `test/integration/**` (all `*.spec.ts`) |
| App | mocks / isolated modules | full `TestAppModule` + real Mongo |

They do not share setup files. Changes here affect **only** `test:e2e`.

---

## Jest lifecycle (e2e run)

When you run `npm run test:e2e`, Jest executes hooks in this order:

```
globalSetup          ← separate Node process; may start Mongo in-memory
    ↓
setupFiles           ← setup-env.ts in each test worker; sets DATABASE_URL, JWT_SECRET, …
    ↓
test file 1          ← beforeAll → tests → afterAll
test file 2          ← …
    …
    ↓
globalTeardown       ← separate Node process; stops Mongo in-memory
```

**Important:** `globalSetup` / `globalTeardown` run in a **different process** from your `beforeAll` / `afterAll`. That is why Mongo in-memory must start in `globalSetup` — starting it inside `beforeAll` and stopping it in `globalTeardown` does not work (the teardown process never sees the instance), and Jest hangs at the end.

`maxWorkers: 1` runs test **files** one after another so they share one database connection profile.

---

## Database modes

`setup-env.ts` calls `resolveTestDatabaseUrl()` and passes the result to `applyTestEnv()`, which sets `DATABASE_URL` and test secrets.

| Mode | How to enable | Mongo source |
|------|---------------|--------------|
| **Default** | nothing | `mongodb://127.0.0.1:27017/profile-test-e2e` (Docker Compose / local `mongod`) |
| **Custom URL** | `TEST_DATABASE_URL=…` | your URI (CI service containers, etc.) |
| **In-memory** | `USE_MEMORY_MONGO=true` | `mongodb-memory-server` started in `globalSetup` |

Examples:

```bash
# Local Mongo (Docker Compose)
npm run test:e2e

# No Docker — downloads mongod binary on first run (~400 MB cached under .cache/mongodb-binaries)
USE_MEMORY_MONGO=true npm run test:e2e

# CI with a service container
TEST_DATABASE_URL=mongodb://127.0.0.1:27017/profile-test-e2e npm run test:e2e
```

Priority: `TEST_DATABASE_URL` wins over in-memory; in-memory wins over the default localhost URI.

---

## Cache under `.cache/`

All test artifacts stay under `apps/api/.cache/` (gitignored), not `/tmp`:

| Entry | Cleared each run? | Purpose |
|-------|-------------------|---------|
| `mongodb-data/` | yes | In-memory Mongo data directory |
| `test-mongo.json` | yes | URI written by `globalSetup` for test workers |
| `mongodb-binaries/` | no | Downloaded `mongod` binary (large; reused) |
| `jest-e2e/` | no | Jest/ts-jest transform cache (faster reruns) |

`cleanTestCache()` runs at the start and end of each e2e run and only removes the first two rows.

---

## What a typical test file does

E2e/integration specs should **not** start Mongo or set env vars — that is handled by `globalSetup` + `setup-env.ts`.

```typescript
import { INestApplication } from "@nestjs/common";
import { createTestApp } from "../support/create-test-app";
import { clearTestDatabase } from "../support/clear-test-database";

describe("My feature (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module); // optional: empty DB for this suite
    // seed data, obtain tokens, …
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should …", async () => {
    // supertest or graphqlRequest(app, …)
  });
});
```

- **`createTestApp()`** — builds `TestAppModule`, applies validation pipe, `app.init()`.
- **`clearTestDatabase()`** — drops the DB when a suite needs a clean slate (suites share the same Mongo instance within one run).
- **`graphqlRequest()`** — POST to `/graphql` with optional auth header.
- Always **`app.close()`** in `afterAll` so Mongoose and HTTP handles shut down.

---

## `TestAppModule` vs production `AppModule`

Tests import `TestAppModule`, not `AppModule`:

- **No `AiToolsModule`** — avoids real external API keys and keeps GraphQL schema stable for tests. `AppCacheModule` is included so isolated e2e setups (e.g. `ai-tools.spec.ts`) can import `AiToolsModule` and resolve `OrchestratorService`.
- **GraphQL schema in memory** — when `NODE_ENV=test`, `autoSchemaFile: true` so tests never overwrite committed `src/schema.gql`.
- Same Mongoose, auth, and domain modules as production otherwise.

---

## Adding a new test

1. Add `test/e2e/my-feature.spec.ts` or `test/integration/my-feature.spec.ts` (suffix must match `jest-e2e.json` → `testMatch`).
2. Use `createTestApp()` + `afterAll` → `app.close()`.
3. Run `npm run test:e2e` (or `USE_MEMORY_MONGO=true …` if you have no local Mongo).

No changes to `jest-e2e.json` are needed unless you introduce a new folder pattern.

---

## Troubleshooting

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| Jest never exits (“did not exit one second after…”) | Async handle left open (Mongo, HTTP) | Ensure `app.close()` in `afterAll`; do not start Mongo in `beforeAll` |
| `ECONNREFUSED` / Mongo timeout | No Mongo on `127.0.0.1:27017` | Start Docker Compose or use `USE_MEMORY_MONGO=true` |
| `ENOSPC: no space left on device` | `/tmp` or disk full (often orphaned `mongo-mem-*` from old hung runs) | Remove stale `/tmp/mongo-mem-*`; e2e cache now uses `apps/api/.cache/` |
| Tests pass locally, fail in CI | CI has no Mongo service | Provide `TEST_DATABASE_URL` or a Mongo service container |
| First in-memory run is slow | Downloading MongoDB 7.0.14 binary | Normal once; binary cached in `.cache/mongodb-binaries` |

Debug open handles (can be slow):

```bash
USE_MEMORY_MONGO=true npx jest --config ./test/config/jest-e2e.json --detectOpenHandles
```

---

## Further reading

- `apps/api/README.md` — project-wide testing commands
- `agents/api.md` — agent-oriented notes (gotchas, `TestAppModule`, schema behavior)
