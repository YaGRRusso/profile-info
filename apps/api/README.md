# @profile-info/api

Code-first NestJS GraphQL API for the profile-info project. It stores profile data
(skills, experiences, educations, organizations, projects, users) in MongoDB and
serves it over a GraphQL endpoint protected by JWT authentication. It is consumed
by the `@profile-info/admin` dashboard.

## Tech stack

- **NestJS 11**: modules, resolvers, services, DI.
- **Apollo GraphQL (code-first)**: schema generated to `src/schema.gql`.
- **MongoDB + Mongoose**: ODM schemas in `src/modules/<name>/schemas/`.
- **Passport JWT**: global guard with `@Public()` opt-out.
- **DataLoader**: batches skill and organization lookups on nested fields.
- **Jest**: unit (`*.spec.ts`) and e2e (`test/*.e2e-spec.ts`) tests.

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
| **`modules/graphql/`** | `GraphqlModule` + `compose-loaders.ts`. Wires Apollo; merges loaders exported by entity modules. | Transport infra — does not implement loader batching logic. |
| **`modules/dashboard/`** | Read-only stats; imports other modules' **services** (not Mongoose models). | Aggregation without bypassing service boundaries. |
| **`modules/ai-tools/`** | AI use-cases (summarize, translate, ATS). Owns `AiEntity`, enums, and mappers. | Converts `IntegrationChatResult` → GraphQL; orchestrates `*ExtractorService` before calling `AiChatProvider`. |

### Request flow (typical)

```
HTTP → Apollo → GqlAuthGuard → Resolver → Service → Mongoose
                              ↘ @ResolveField → DataLoader → Service
```

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

After GraphQL type changes, rebuild or boot the API so `src/schema.gql` regenerates, then run admin codegen (`npm run admin:build` or `npx graphql-codegen` in `apps/admin`).
