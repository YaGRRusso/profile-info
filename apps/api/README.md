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
- **Jest**: unit (`src/**/*.spec.ts`), e2e (`test/e2e/`), and integration (`test/integration/`) tests. Coverage: `npm run test:coverage`.

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
```

| Folder | What it is | Why it exists |
|--------|------------|---------------|
| **`common/`** | Framework-agnostic utilities (`clearObject`, `assertValidObjectId`, `orchestrate`). | Reusable logic without Nest/Mongoose/GraphQL coupling. |
| **`core/`** | Cross-cutting infra: configs, decorators, shared inputs/entities, `domain-events`, `UserRole`. | Things many modules need but that are not tied to one entity. |
| **`integrations/open-router/`** | OpenRouter adapter + AI port (`ai-chat.provider.ts`). Binds `AiChatProvider` → `OpenRouterService`; mappers translate SDK ↔ loose DTO. | SDK and port live together; `ai-tools` owns strong GraphQL types. |
| **`integrations/github/`** | GitHub adapter for repository metadata (`RepositoryMetadataProvider`). | Same port pattern as Tavily/OpenRouter. |
| **`integrations/tavily/`** | Tavily adapter for web content extraction (`WebContentProvider`). | Used by resource-detail extractors. |
| **`modules/`** | Business domains. Each CRUD entity = resolver + service + schema + entity + dto. | Where profile rules and GraphQL operations live. |
| **`modules/auth/`** | JWT guard, `signIn`, `getMe`. Global auth, not a CRUD entity. | Security cross-cut; uses `UsersService.findOneByEmailWithPassword`. |
| **`modules/graphql/`** | `GraphqlModule` + `LoadersService`. Wires Apollo; composes loaders exported by entity modules. | Transport infra — batching logic stays in each `*LoaderService`. |
| **`modules/dashboard/`** | Read-only stats; imports other modules' **services** (not Mongoose models). | Aggregation without bypassing service boundaries. |
| **`modules/resume/`** | Aggregates profile data and renders a PDF via `GET /resume.pdf?locale=`. Uses `pdfkit`; imports feature services like dashboard. | CV export for admin and external portfolio clients. |
| **`modules/ai-tools/`** | AI use-cases (summarize, translate, ATS). Owns `AiEntity`, enums, and mappers. | Converts `IntegrationChatResult` → GraphQL; orchestrates `*ExtractorService` before calling `AiChatProvider`. |

### Request flow (typical)

```
HTTP → Apollo → GqlAuthGuard → RolesGuard → Resolver → Service → Mongoose
                              ↘ @ResolveField → DataLoader → Service
```

## Security model

This API backs a **public portfolio** and an **admin dashboard**.
The threat model is intentional, not accidental:

| Operation class | Auth | Who |
|-----------------|------|-----|
| Profile reads (`findManySkills`, `findManyExperiences`, …) | None (`@Public()`) | Anyone |
| `GET /resume.pdf` | None (REST; guard skips non-GraphQL) | Anyone |
| `signIn` | None (`@Public()`) | Anyone |
| `getMe` | JWT | Any authenticated user |
| `dashboard` | JWT + `ADMIN` role | Admin only |
| All mutations (CRUD + AI) | JWT + `ADMIN` role | Admin only |

**Decisions:**

- Profile data is public by design — skills, experiences, projects, etc. are meant to be read without a token.
- User queries are also public (email is exposed). Acceptable for a single-owner portfolio; do not store secrets in user fields.
- Mutations require a valid JWT **and** `UserRole.ADMIN`. A `USER` token receives `403 Forbidden`.
- Missing or invalid JWT on protected operations returns GraphQL error extension `code: UNAUTHENTICATED` (the admin client clears auth on this).
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
├── integrations/
│   ├── open-router/          # AI port + OpenRouter adapter
│   ├── github/
│   └── tavily/
└── modules/
    ├── graphql/
    ├── auth/
    ├── dashboard/
    ├── resume/               # PDF export (REST GET /resume.pdf)
    ├── skills/               # Canonical CRUD module; exports SkillsLoaderService
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
GET /resume.pdf?locale=en|pt|es
```

Returns `application/pdf` with `Content-Disposition: attachment; filename="resume.pdf"`. Optional `locale` query (defaults to `en`; invalid values fall back to `en`). Section labels come from `resume.labels.ts`; content uses `pickTranslation` for entity i18n. Aggregates the admin user's profile data (top items by `relevance`, completed educations/courses only).

The admin dashboard downloads this endpoint directly (base URL derived from `VITE_API_URL` by stripping `/graphql`).

## Testing

```bash
npm run test          # unit tests
npm run test:e2e      # GraphQL auth, delete cascade, resume PDF, health smoke
```

E2E tests use `mongodb://127.0.0.1:27017/profile-test-e2e` by default (Docker Compose MongoDB). Set `TEST_DATABASE_URL` to override. Set `USE_MEMORY_MONGO=true` for in-memory Mongo (downloads binary on first run).

Seed admin credentials: `admin@profile.info` / `admin123`.

## Further reading

- `docs/ER_MODEL.md`: MongoDB entity-relationship diagram and delete behavior
- `docs/CLEAN_ARCHITECTURE.md`: dependency rules and layer breakdown
