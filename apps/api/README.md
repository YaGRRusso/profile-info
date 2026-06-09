# @profile-info/api

Code-first NestJS GraphQL API for the profile-info project. It stores profile data
(skills, experiences, educations, organizations, projects, users) in MongoDB and
serves it over a GraphQL endpoint protected by JWT authentication. It is consumed
by the `@profile-info/admin` dashboard.

## Tech stack

- **NestJS 11**: the application framework. Modules, resolvers, services, and DI
  throughout `src/`.
- **Apollo GraphQL (code-first)**: `@nestjs/graphql` + `@nestjs/apollo` in
  `app.module.ts`. The schema is generated from TypeScript decorators to
  `src/schema.gql`.
- **MongoDB + Mongoose**: `@nestjs/mongoose`, ODM schemas co-located in
  `src/modules/<name>/schemas/`, connection configured in `app.module.ts`.
- **Passport JWT**: `src/modules/auth/`, a global guard with a `@Public()` opt-out.
- **class-validator / class-transformer**: input validation on GraphQL inputs via
  a global `ValidationPipe`.
- **DataLoader**: `src/modules/graphql/loaders.helper.ts`, batches skill and
  organization lookups to avoid N+1 queries on nested fields.
- **Jest**: unit (`*.spec.ts`) and e2e (`test/*.e2e-spec.ts`) tests.

## Architecture

The source is organized as a modular monolith with a strict dependency rule:

- `common` imports nothing.
- `core` imports only `common`.
- `integrations` import only `common`; each owns its **port** (an abstract class used as the DI token) plus neutral types, and maps the external API to them. Never import from `modules`.
- `modules` import `common`, `core`, and integration **modules** for DI wiring; services inject the abstract **port** by type (no `Symbol`, no `@Inject()`).

- `common/` — generic, framework-agnostic TypeScript primitives (helpers, the task orchestrator). No integration contracts.
- `core/` — cross-cutting NestJS infrastructure (configs, shared GraphQL inputs/entities, decorators, domain event payloads, `UserRole` enum).
- `integrations/` — adapters that own their capability port and map external APIs to neutral contracts. `ai/` is a capability boundary (port + types) with vendors nested under it (`ai/open-router/`); `github/` and `tavily/` are flat.
- `modules/` — business domains (CRUD entities, auth, dashboard, AI tools, GraphQL loaders).

## Project structure

```
src/
├── main.ts                   # Bootstrap: create app, validation pipe, start server.
├── app.module.ts             # Root module: Config, Mongoose, GraphQL, feature modules.
├── app.controller.ts         # Minimal REST GET / health route ("Hello World!").
├── schema.gql                # Auto-generated GraphQL schema (code-first output).
├── common/                   # Generic, framework-agnostic primitives.
│   ├── helpers/              # object / daterange / breakpoint helpers.
│   └── execution/orchestrator.helper.ts  # Concurrency-limited task runner.
├── core/                     # Shared NestJS building blocks (domain-agnostic).
│   ├── schemas/              # BaseModel, paginated/translation/daterange schemas.
│   ├── entities/             # BaseEntity and shared GraphQL object types.
│   ├── inputs/               # Pagination, sort, date-range, translation, url inputs.
│   ├── decorators/           # @Public, @OptionalField.
│   ├── events/                     # Domain event names + neutral payload classes.
│   ├── enums/user-role.enum.ts     # Shared UserRole enum.
│   └── configs/              # app.config (port/host/CORS), validation.config.
├── integrations/             # Adapters; each owns its port (abstract class) + neutral types.
│   ├── ai/                   # AI capability boundary: AiProvider port + ai.types.
│   │   └── open-router/      # OpenRouterService implements AiProvider (SDK + mappers inside).
│   ├── github/               # RepositoryMetadataProvider port; GithubService implements it.
│   └── tavily/               # WebContentProvider port; TavilyService implements it.
└── modules/                  # Business domains.
    ├── graphql/              # GraphqlModule, DataLoaders, GraphQL context (Ctx).
    ├── ai-tools/             # AI use-cases; owns AiEntity; injects the abstract ports.
    ├── auth/                 # JWT auth: signIn (public), getMe, global guard, @CurrentUser.
    ├── dashboard/            # Read-only aggregation via feature services.
    ├── skills/               # Feature module (the canonical example to copy).
    │   ├── skills.resolver.ts      # Explicit @Query / @Mutation methods.
    │   ├── skills.service.ts       # Explicit CRUD over the Mongoose model.
    │   ├── schemas/skill.schema.ts # Co-located Mongoose model.
    │   ├── entities/skill.entity.ts# GraphQL ObjectType.
    │   ├── enums/category.enum.ts  # SkillCategory.
    │   └── dto/                    # create / update / filter / sort inputs.
    ├── users/                # Users; hashes passwords; auth uses findOneByEmailWithPassword.
    ├── experiences/          # Work experience; @ResolveField uses DataLoaders.
    ├── educations/           # Education history.
    ├── organizations/        # Organizations referenced by experiences/educations.
    └── projects/             # Portfolio projects.
```

## Requirements

- Node >= 22
- npm >= 11
- Docker with the Compose plugin (for MongoDB), or a reachable MongoDB instance

## Getting started

1. Install dependencies (from the repo root, installs all workspaces):

```bash
npm install
```

2. Start MongoDB (from the repo root):

```bash
npm run docker:up
```

3. Create the env file from the example:

```bash
cp .env.example .env.development
```

4. Run the API in watch mode (from the repo root):

```bash
npm run api:dev
```
