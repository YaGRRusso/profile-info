# @profile-info/api

Code-first NestJS GraphQL API for the profile-info project. It stores profile data
(skills, experiences, educations, organizations, projects, users) in MongoDB and
serves it over a GraphQL endpoint protected by JWT authentication. It is consumed
by the `@profile-info/admin` dashboard.

## Tech stack

- **NestJS 11**: modules, resolvers, services, DI.
- **Apollo GraphQL (code-first)**: schema generated to `src/schema.gql`.
- **MongoDB + Mongoose**: ODM schemas in `src/modules/<name>/schemas/`.
- **Passport JWT**: global `GqlAuthGuard` with `@Public()` opt-out and `RolesGuard` for admin-only writes.
- **DataLoader**: batches skill and organization lookups on nested fields.
- **Jest**: unit (`src/**/*.spec.ts`, including `core/persistence/repositories/*.spec.ts`), e2e (`test/e2e/`), and integration (`test/integration/`). E2e/integration require MongoDB on `localhost:27017`. Coverage: `npm run test:coverage`.

## Dependency map

**Rule of thumb:** dependencies flow inward. Outer layers never import inner business code.

```
common          ← pure TS helpers (imports nothing)
  ↑
core            ← shared Nest/GraphQL/Mongoose primitives, event contracts
  ↑
integrations    ← external APIs; each folder = one adapter + port (abstract class)
  ↑
modules         ← business domains (resolvers, services, schemas)
  ↑
platform        ← transport composition (GraphQL wiring, DataLoader aggregation)
```

| Folder | What it is | Why it exists |
|--------|------------|---------------|
| **`common/`** | Framework-agnostic utilities (`clearObject`, `assertValidObjectId`, `orchestrate`). | Reusable logic without Nest/Mongoose/GraphQL coupling. |
| **`core/`** | Cross-cutting infra: configs, validation decorators, shared inputs/entities, `domain-events`, `AuthContext`, `UserRole`. | Domain/service contracts — not GraphQL transport. |
| **`integrations/open-router/`** | OpenRouter adapter + AI port (`ai-chat.provider.ts`). Binds `AiChatProvider` → `OpenRouterService`; mappers translate SDK ↔ loose DTO. | SDK and port live together; `ai-tools` owns strong GraphQL types. |
| **`integrations/github/`** | GitHub adapter for repository metadata (`RepositoryMetadataProvider`). | Same port pattern as Tavily/OpenRouter. |
| **`integrations/tavily/`** | Tavily adapter for web content extraction (`WebContentProvider`). | Used by resource-detail extractors. |
| **`modules/`** | Business domains. Each CRUD entity = resolver + service + schema + entity + dto. | Where profile rules and GraphQL operations live. |
| **`platform/graphql/`** | GraphQL transport: `GraphqlModule`, `LoadersService`, loader registry augmentation. | Apollo wiring and per-request context. |
| **`modules/auth/`** | JWT guard, `signIn`, `getMe`. Global auth, not a CRUD entity. | Security cross-cut; uses `UsersService.findOneByEmailWithPassword`. |
| **`modules/dashboard/`** | Read-only stats; imports other modules' **services** (not Mongoose models). | Aggregation without bypassing service boundaries. |
| **`modules/resume/`** | Aggregates a user's profile data and renders a PDF via `GET /resume.pdf?userId=&locale=`. Uses `pdfkit`; imports feature services like dashboard. | CV export for admin and external portfolio clients. |
| **`modules/ai-tools/`** | AI use-cases (summarize, translate, ATS). Owns `AiEntity`, enums, and mappers. | Converts `IntegrationChatResult` → GraphQL; orchestrates `*ExtractorService` before calling `AiChatProvider`. |

### Request flow (typical)

```
HTTP → Apollo → GqlAuthGuard → RolesGuard → Resolver → Service → Repository (CrudRepository + mapper) → Mongoose
                              ↘ @ResolveField → DataLoader → Service
```

## Security model

This API backs a **public portfolio** and an **admin dashboard**.
The threat model is intentional, not accidental:

| Operation class | Auth | Who |
|-----------------|------|-----|
| Catalog reads (`findManySkills`, `findManyOrganizations`, `findManyUsers`) | JWT | Authenticated users |
| Private entity reads (`findManyCourses`, …) | JWT + `@Auth()` | Tenant-scoped |
| `GET /resume.pdf?userId=` | None (REST; `@Public()`) | Anyone with profile owner id |
| `signIn` | None (`@Public()`) | Anyone |
| `getMe` / `updateMe` | JWT | Any authenticated user |
| `dashboard` | JWT + `@Auth()` | USER (own data) / `SUPER_ADMIN` (cross-tenant) |
| AI mutations (`atsSummarize`, `summarize`, `translate`) | JWT | Any authenticated user |
| Catalog / user CRUD mutations | JWT + `SUPER_ADMIN` | Super admin only |
| Private entity CRUD mutations | JWT + `@Auth()` | Tenant-scoped (`USER` own data; `SUPER_ADMIN` by explicit ID) |

**Decisions:**

- Private portfolio data requires JWT; `USER` sees only `ownerId === ctx.userId` (404 on wrong ID).
- Catalog reads require JWT (phase 5a); mutations remain `SUPER_ADMIN`.
- Missing or invalid JWT: guards throw `UnauthorizedException`; Apollo `formatError` exposes `extensions.code: UNAUTHENTICATED`. Insufficient role → `ForbiddenException` → `FORBIDDEN`. Admin clears auth on `UNAUTHENTICATED`.
- `signIn` always returns `401 Unauthorized` for invalid credentials — no email enumeration via `404`.
- Passwords are bcrypt-hashed on create **and** update; the hash is never exposed via GraphQL (`select: false`).

### AI flow

```
Resolver → AiToolsService → AiChatProvider.chat()  [loose integration DTO]
                         → mapChatResultToEntity()  [strong GraphQL types]
                         ↘ ResourceDetailService → *ExtractorService → Github / Tavily ports
```

### Who imports whom

| From | Can import |
|------|------------|
| `modules/*` | `common`, `core`, `integrations/*` **modules** (for DI); inject **ports** by type |
| `integrations/*` | `common`, own internals |
| `core` | `common` |
| `common` | nothing |

`integrations` **never** import from `modules`. `ai-tools` injects `AiChatProvider`, maps `IntegrationChatResult` → `AiEntity`, and does not import OpenRouter types.

## Project structure

```
src/
├── main.ts
├── app.module.ts             # Composition root: infra → GraphqlModule → domain modules
├── schema.gql                # Auto-generated (commit after API type changes)
├── common/
├── core/
│   └── persistence/          # CrudRepository, StatsRepository, CrudMapperInterface, scoped()
├── integrations/
│   ├── open-router/          # AI port + OpenRouter adapter
│   ├── github/
│   └── tavily/
└── modules/
    ├── graphql/
    ├── auth/
    ├── dashboard/
    ├── resume/               # PDF export (REST GET /resume.pdf)
    ├── skills/               # Catalog CRUD; exports SkillsLoaderService
    ├── ai-tools/
    │   ├── resource-detail/  # Orchestrator + *ExtractorService per source
    │   ├── prompts/
    │   └── ...
    └── ...
```

## Requirements

- Node >= 22
- npm >= 11
- Docker with the Compose plugin (for MongoDB), or a reachable MongoDB instance

## Getting started

1. Install dependencies (from the repo root):

```bash
npm install
```

2. Start MongoDB:

```bash
npm run docker:up
```

3. Create the env file:

```bash
cp .env.example .env.development
```

4. Run the API in watch mode:

```bash
npm run api:dev
```

After GraphQL type changes, rebuild or boot the API so `src/schema.gql` regenerates, then run admin codegen (`npm run admin:build` or `npx graphql-codegen` in `apps/admin`). Tests never write to this file (`NODE_ENV=test` keeps the schema in memory).

### Resume PDF export

```
GET /resume.pdf?userId=<id>&locale=en|pt|es
```

Returns `application/pdf` with `Content-Disposition: attachment; filename="resume.pdf"`. Required `userId` query (Mongo ObjectId). Optional `locale` (defaults to `en`; invalid values fall back to `en`). Section labels come from `resume.labels.ts`; content uses `pickTranslation` for entity i18n. Aggregates the requested user's profile data (top items by `relevance`, completed educations/courses only). Private entities are owner-scoped to `userId` even when the profile owner is `SUPER_ADMIN`.

The admin dashboard downloads this endpoint directly (base URL derived from `VITE_API_URL` by stripping `/graphql`).

## Testing

```bash
npm run test          # unit tests
npm run test:e2e      # GraphQL auth, delete cascade, resume PDF, health smoke
```

E2E tests use `mongodb://127.0.0.1:27017/profile-test-e2e` by default (Docker Compose MongoDB). Set `TEST_DATABASE_URL` to override. Set `USE_MEMORY_MONGO=true` for in-memory Mongo (downloads binary on first run).

See **`test/README.md`** for Jest lifecycle, folder layout, database modes, and troubleshooting.

Seed credentials: `alice@profile.info` / `alice.pass`, `bob@profile.info` / `bob.pass` (USER), `admin@profile.info` / `pass.123` (SUPER_ADMIN). After `npm run seed`, the console prints fixed dev API tokens (`pi_…`) — send as `X-Api-Key` on GraphQL requests.

## Further reading

- `docs/ER_MODEL.md`: MongoDB entity-relationship diagram and delete behavior
- `docs/CLEAN_ARCHITECTURE.md`: dependency rules and layer breakdown
