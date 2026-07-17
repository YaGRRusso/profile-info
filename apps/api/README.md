# @profile-info/api

Code-first NestJS GraphQL API for the profile-info project. It stores profile data
(skills, experiences, educations, organizations, projects, users) in MongoDB and
serves it over a GraphQL endpoint protected by JWT authentication. It is consumed
by the `@profile-info/admin` dashboard.

## Tech stack

- **NestJS 11**: modules, resolvers, services, DI.
- **Apollo GraphQL (code-first)**: schema generated to `src/schema.gql`.
- **MongoDB + Mongoose**: ODM schemas in `src/modules/<name>/schemas/`.
- **Passport JWT**: global `GqlAuthenticationGuard` with `@Public()` opt-out and `GqlAuthorizationGuard` for roles and API token permissions.
- **DataLoader**: batches skill, organization, and user lookups on nested fields.
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
platform        ← transport composition (GraphQL wiring, DataLoader aggregation);
                  may import modules for composition only
```

| Folder | What it is | Why it exists |
|--------|------------|---------------|
| **`common/`** | Framework-agnostic utilities (`clearObject`, `assertValidObjectId`, …). | Reusable logic without Nest/Mongoose/GraphQL coupling. |
| **`core/`** | Cross-cutting infra: configs, Nest `CacheModule` (`AppCacheModule`), `OrchestratorService`, validation decorators, shared inputs/entities, `domain-events`, `AuthContext`, `UserRole`. | Domain/service contracts — not GraphQL transport. |
| **`integrations/open-router/`** | OpenRouter adapter + AI port (`ai-chat.provider.ts`). Binds `AiChatProvider` → `OpenRouterService`; mappers translate SDK ↔ loose DTO. | SDK and port live together; `ai-tools` owns strong GraphQL types. |
| **`integrations/tavily/`** | Tavily adapter: `WebContentProvider` (page extract) + `WebSearchProvider` (query search). | AI context enrichment (ADR 004). |
| **`modules/`** | Business domains. Each CRUD entity = resolver + service + schema + entity + dto. | Where profile rules and GraphQL operations live. |
| **`platform/graphql/`** | GraphQL transport: `GraphqlModule`, `LoadersService`, loader registry augmentation. | Apollo wiring and per-request context. |
| **`modules/auth/`** | JWT strategies, `signIn`, `getMe`. `GqlAuthenticationGuard` + `GqlAuthorizationGuard`. | Security cross-cut; uses `UsersService.findOneByEmailWithPassword`. |
| **`modules/dashboard/`** | Read-only stats; imports other modules' **services** (not Mongoose models). | Aggregation without bypassing service boundaries. |
| **`modules/resume/`** | Aggregates a user's profile data and renders a PDF via `GET /resume.pdf?userId=&locale=`. Uses `pdfkit`; imports feature services like dashboard. | CV export for admin and external portfolio clients. |
| **`modules/ai-tools/`** | AI use-cases (summarize, translate, ATS). Owns `AiEntity`, enums, and mappers. | `AiToolsService` orchestrates `ChatService` + `ContextService`; ports stay behind those collaborators. |

### Request flow (typical)

```
HTTP → Apollo → GqlAuthenticationGuard → GqlAuthorizationGuard → Resolver → Service → Repository (CrudRepository + mapper) → Mongoose
                              ↘ @ResolveField → DataLoader → Service
```

## Security model

This API backs a **public portfolio** and an **admin dashboard**.
The threat model is intentional, not accidental:

| Operation class | Auth | Who |
|-----------------|------|-----|
| Catalog reads (`findManySkills`, `findManyOrganizations`) | JWT | Authenticated; scoped (`USER`: GLOBAL + own LOCAL; `SUPER_ADMIN`: all) — ADR 001 |
| User list / user admin mutations | JWT + `@Roles(SUPER_ADMIN)` | Super admin only |
| Private entity reads (`findManyCourses`, …) | JWT + `@Auth()` | Tenant-scoped |
| `GET /resume.pdf?userId=` | None (REST; `@Public()`) | Anyone with profile owner id |
| `signIn` / `register` | None (`@Public()`) | Anyone (`register` creates `disabled: true` USER) |
| `getMe` / `updateMe` | JWT | Any authenticated enabled user |
| `dashboard` | JWT + `@Auth()` | USER (own data) / `SUPER_ADMIN` (cross-tenant) |
| AI mutations (`atsSummarize`, `summarize`, `translate`) | JWT + per-user throttle | Any authenticated user (ADR 003) |
| Catalog mutations | JWT + `@Auth()` | `USER`: own LOCAL only; `SUPER_ADMIN`: GLOBAL only (ADR 001) |
| Private entity CRUD mutations | JWT + `@Auth()` | Tenant-scoped (`USER` own data; `SUPER_ADMIN` by explicit ID) |

**Decisions:**

- Private portfolio data requires JWT; `USER` sees only own rows (404 on wrong ID).
- Catalog writes follow partition rules in ADR 001 — not a blanket `SUPER_ADMIN`-only mutate gate.
- Public `register` creates disabled accounts; `SUPER_ADMIN` enables via Users admin / `updateOneUser`.
- Missing or invalid JWT: guards throw `UnauthorizedException`; Apollo `formatError` exposes `extensions.code: UNAUTHENTICATED`. Insufficient role → `ForbiddenException` → `FORBIDDEN`. Admin clears auth on `UNAUTHENTICATED`.
- `signIn` always returns `401 Unauthorized` for invalid credentials — no email enumeration via `404`.
- Passwords are bcrypt-hashed on create **and** update; the hash is never exposed via GraphQL (`select: false`).
### AI flow

```
Resolver → AiToolsService → ChatService → AiChatProvider  [→ AiEntity]
                         ↘ ContextService → WebContentProvider / WebSearchProvider (Tavily)
```

### Who imports whom

| From | Can import |
|------|------------|
| `modules/*` | `common`, `core`, `integrations/*` **modules** (for DI); inject **ports** by type |
| `platform/*` | `common`, `core`, `modules/*` (composition only) |
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
│   └── tavily/               # WebContentProvider + WebSearchProvider (ADR 004)
├── platform/
│   └── graphql/              # GraphqlModule, LoadersService, loader registry
└── modules/
    ├── auth/
    ├── dashboard/
    ├── resume/               # PDF export (REST GET /resume.pdf)
    ├── skills/               # Catalog CRUD; exports SkillsLoaderService
    ├── organizations/
    ├── users/                # UsersLoaderService (batchUsers)
    ├── ai-tools/
    │   ├── chat/             # ChatService → AiChatProvider
    │   ├── context/          # ContextService → Tavily ports (ADR 004)
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

The admin dashboard downloads this endpoint directly (`VITE_API_URL` + path via `@/service/rest`).

## Testing

```bash
npm run test          # unit tests
npm run test:e2e      # GraphQL auth, delete cascade, resume PDF, health smoke
```

E2E tests use `mongodb://127.0.0.1:27017/profile-test-e2e` by default (Docker Compose MongoDB). Set `TEST_DATABASE_URL` to override. Set `USE_MEMORY_MONGO=true` for in-memory Mongo (downloads binary on first run).

See **`test/README.md`** for Jest lifecycle, folder layout, database modes, and troubleshooting.

Seed credentials: personas at `*@profile.info` with password `123123` (`empty`, `joao`, `maria`, `full`, `pending`, `admin`). After `npm run seed`, the console prints fixed dev API tokens (`pi_…`) — send as `X-Api-Key` on GraphQL requests. Persona matrix and catalog layout: `seed/README.md`.

## Further reading

- `docs/ER_MODEL.md`: MongoDB entity-relationship diagram and delete behavior
- `docs/CLEAN_ARCHITECTURE.md`: dependency rules and layer breakdown
- `docs/adr/001-local-catalog.md`: skill/organization partition scope
- `docs/adr/003-platform-ai-throttle.md`: per-user AI mutation throttle
- `docs/BACKLOG.md`: deferred work
