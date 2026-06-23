# @profile-info/api

> Context for AI agents working in the API package. Keep it accurate; an agent will trust it.

## Maintaining this rule

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file
and update `apps/api/README.md` when setup or run changes. Update `apps/api/docs/ER_MODEL.md`
when schemas, references, or delete behavior change.

## Overview

The NestJS GraphQL API for profile-info. It is code-first: GraphQL types are TypeScript classes with `@ObjectType` / `@InputType` / `@Field` decorators, and the schema is generated to `src/schema.gql`. Data lives in MongoDB via Mongoose. Every operation except `signIn` requires a JWT. The admin app is the only known client.

The source is a modular monolith with a strict dependency rule (`modules → integrations → common` and `modules → core → common`; `common` imports nothing; `integrations` never import from `modules`). The top-level layers under `src/` are `common/` (pure TS), `core/` (cross-cutting NestJS infra), `integrations/` (external system adapters), and `modules/` (business domains).

Feature modules follow the same explicit CRUD pattern: resolver methods call service methods that use the injected Mongoose model. Copy `src/modules/skills/` as the reference implementation.

## Architecture & flow

Entry point `src/main.ts`:

1. `NestFactory.create(AppModule)`.
2. `validationConfig(app)` installs a global `ValidationPipe` with `whitelist: true`, `transform: true`, and `stopAtFirstError: true`.
3. `await appConfig(app)` reads `PORT` (default 8080) and `HOST` (default `0.0.0.0`), enables CORS, and starts listening.

`src/app.module.ts` composition root (ordered: infra → GraphQL → domain):

- `EventEmitterModule.forRoot({ global: true })`.
- `ConfigModule.forRoot({ isGlobal: true })`.
- `MongooseModule.forRootAsync` reads `DATABASE_URL`.
- `GraphqlModule` (`modules/graphql/graphql.module.ts`): wraps `GraphQLModule.forRootAsync` with `ApolloDriver`, schema at `src/schema.gql`, and per-request DataLoaders via `createLoaders(...)` from `modules/graphql/loaders.helper.ts`.
- Feature modules: `AuthModule`, CRUD entities, `DashboardModule` (read-only aggregation), `ResumeModule` (PDF export), `AiToolsModule`.

Request flow: Apollo → `GqlAuthGuard` (unless `@Public()`) → resolver → service → Mongoose model. Nested fields use `@ResolveField` + per-request DataLoaders. REST routes (e.g. `GET /resume.pdf`) skip `GqlAuthGuard` when `context.getType() !== "graphql"`.

## Data model (ER)

Full diagram and field detail: `apps/api/docs/ER_MODEL.md`.

- MongoDB via Mongoose; seven top-level collections (User, Skill, Organization, Experience, Education, Course, Project).
- Organization is referenced by Experience, Education, and Course; Skill is referenced by arrays on Education, Course, Project, and nested Experience roles.
- Deletes use domain events (`skill.deleted`, `organization.deleted`) for detach and purge; see ER doc for behavior.

## Core technologies

- **@nestjs/graphql + @nestjs/apollo**: code-first schema in `src/schema.gql`.
- **@nestjs/mongoose + mongoose**: models in `src/schemas/`, registered per feature module.
- **@nestjs/jwt + passport**: global 8h JWT in `src/auth/`.
- **@nestjs/event-emitter**: domain events on delete (see below).
- **bcryptjs**: password hashing in `users/users.service.ts`.
- **dataloader + lodash**: `modules/graphql/loaders.helper.ts`.
- **class-validator / class-transformer**: input validation via global `ValidationPipe`.

## Module / directory breakdown

`common/` (pure TS, no NestJS/Mongoose/GraphQL imports):

- `helpers/`: `object.helper.ts` (`clearObject`), `object-id.helper.ts` (`assertValidObjectId`, `assertValidObjectIds`), `daterange.helper.ts` (`sortDateRange`), `pick-translation.helper.ts` (`pickTranslation`), `format-period.helper.ts` (`formatPeriod`), `breakpoint.helper.ts`.
- `i18n/locales.ts`: `Locale`, `SUPPORTED_CONTENT_LOCALES`, `normalizeLocale` — app-owned copy (resume PDF, future errors). Entity `i18n[].locale` is a free string (`@IsString` + `@IsNotEmpty` only).
- `pdf/`: domain-agnostic PDFKit layer — `PdfContext`, `DEFAULT_PDF_THEME`, `PDF_SPACING` scale (`xs`–`block`), layout primitives in `layout/` (`renderSection`, `renderEntryBlock`, `renderLabeledLinks`). `renderEntryBlock` and `renderSection` measure content height and call `ensureBlockFits` so section titles and entry headers are not orphaned at page breaks; long descriptions and multi-entry sections still flow across pages.
- `execution/orchestrator.helper.ts`: `orchestrate(...)`, a concurrency-limited + timeout task runner (plain function, used by `ai-tools`).

`common` holds only generic primitives — it does **not** own integration contracts. Each capability boundary owns its own port (see `integrations/`).

`core/` (cross-cutting NestJS infra, domain-agnostic):

- `persistence/`: generic MongoDB layer — `CrudRepository`, `StatsRepository` (catalog), `TenantScopedStatsRepository` (private entities), `TenantScopedCrudRepository`, `BatchCount`, `withTenantScope`, `assertBatchSucceeded`. Unit specs in `persistence/repositories/*.spec.ts`.
- `filters/persistence-exception.filter.ts`: global `APP_FILTER` — maps persistence errors to HTTP exceptions: Mongo `E11000`/`E11001` → 409, Mongo `121` + Mongoose `ValidationError`/`CastError` → 400, `MongooseServerSelectionError` → 503. Services do not catch these; use `assertDuplicate` / `assertReferencesExist` in `common/helpers/assert.helper.ts` only for domain-specific pre-checks.
- `events/`: `domain-events.ts` (event name constants), `skill-deleted.event.ts`, `organization-deleted.event.ts` (neutral payload classes).
- `enums/credential-kind.enum.ts`: shared `CredentialKind` enum (`SESSION`, `API_TOKEN`).
- `enums/user-role.enum.ts`: shared `UserRole` enum (`USER`, `SUPER_ADMIN`).
- `enums/api-token-permission.enum.ts`: shared `ApiTokenPermission` enum (`QUERY`, `MUTATE`).
- `schemas/paginated.schema.ts`: `createPaginatedModel(Entity)` for `{ found, nodes }`.
- `schemas/base.schema.ts`, `translation.schema.ts`, `daterange.schema.ts`, `url.schema.ts`: shared Mongoose sub-schemas.
- `entities/`: `BaseEntity`, `BatchEntity` (`succeeded`, `failed`), date-range, translation, url GraphQL types.
- `inputs/`: pagination, sort factory, date-range, translation, url inputs.
- `decorators/`: `@Public()`, `@RequiredField()`, `@OptionalField()`.
- `configs/`: `app.config.ts`, `validation.config.ts`.
- `pdf/`: cross-cutting PDF infra — `PdfRenderService` (PDFKit document lifecycle → `Buffer`), `PdfModule`. Rendering primitives (context, theme, layout) live in `common/pdf/`. Import `PdfModule` from use-case modules that export PDFs.

`integrations/` (each owns its port — an **abstract class** used as the DI token — plus neutral types; map vendor types → neutral contracts; never import from `modules`):

- `open-router/`: OpenRouter adapter + AI port (`ai-chat.provider.ts`: `AiChatProvider` + loose `IntegrationChatResult`). `OpenRouterModule` binds port → `OpenRouterService`; mappers translate SDK ↔ integration DTO. Flat sibling of `github/` and `tavily/`.
- `github/`: flat (a distinct capability, not a swappable vendor). Owns `repository-metadata.provider.ts` (abstract `RepositoryMetadataProvider` + types); `GithubService extends RepositoryMetadataProvider`; `github.module.ts` binds via `useClass`.
- `tavily/`: flat. Owns `web-content.provider.ts` (abstract `WebContentProvider` + types); `TavilyService extends WebContentProvider` (vendor `Tavily*` types stay inside the adapter); `tavily.module.ts` binds via `useClass`.

DI pattern is the NestJS-idiomatic **abstract class as token**: ports are abstract classes (no `Symbol`, no `@Inject()`); modules bind `{ provide: Port, useClass: Impl }` and consumers inject the port by type. A service implementing a port `extends` it and must call `super()` in its constructor.

`modules/` (business domains):

- `graphql/`: `graphql.module.ts` (single module — Apollo wiring), `loaders.service.ts` (composes per-entity loaders), `context.interface.ts` (`Ctx`). `forRootAsync` injects exported `*LoaderService` from entity modules; batching logic stays in those services.
- `auth/`: global `GqlAuthGuard` (JWT + `UNAUTHENTICATED` GraphQL extension) and `RolesGuard` (`@Roles(SUPER_ADMIN)` on catalog mutations and user CRUD). `signIn` (`@Public`) returns JWT; `getMe` returns current user; `updateMe` lets any authenticated user update their own profile (no `role` in input). `@CurrentUser()` → raw `UserModel` (profile ops). `@Auth()` → `AuthContext` (`core/context/auth-context.interface.ts`): authenticated caller (`userId`, `role`, `credentialKind`; API tokens add `permissions`). Session: `toSessionAuthContext()`; API tokens (future): `toApiTokenAuthContext()`. Helpers in `auth-context.helper.ts`: `isSession`, `isApiToken`, `isSuperAdmin`, `hasPermission`, `toTenantScope`. Distinct from GraphQL `@Context()` (`Ctx` / loaders). Private entities migrate **one at a time** per ADR 001 — **Course** is the reference (auth on all ops, `repository.tenant.*`, required `ctx`). Legacy entities may still use `@Public()` reads until their turn.
- `ai-tools/`: AI use-cases. Owns `AiEntity` GraphQL types, enums (`ChatRole`, `ChatFinishReason`), and mappers (`IntegrationChatResult` → `AiEntity`). `resource-detail/` orchestrates `*ExtractorService` classes. Injects `AiChatProvider`, `RepositoryMetadataProvider`, `WebContentProvider`. `AiToolsModule` imports `OpenRouterModule`, `GithubModule`, `TavilyModule`.
- `dashboard/`: read-only aggregation via feature **services**. `@Auth() ctx` on `dashboard` query. Private entities: `count(ctx)` / `countByField(ctx)` / `findRecentActivity(ctx)` (tenant-scoped). Catalog (`skills`, `organizations`): global `count()` / stats. USER sees own private totals + full catalog; `SUPER_ADMIN` sees all private data (`crossTenant`).
- `resume/`: `ResumeService` aggregates profile data (top by `relevance`, completed educations/courses); skills use top `skillsPerCategory` per category (empty categories omitted). PDF export via `GET /resume.pdf?locale=` (`normalizeLocale`, `pickTranslation`, `formatPeriod`, `resolveResumeLabels` in `resume.labels.ts`). Filename is always `resume.pdf`. Uses first `SUPER_ADMIN` user as profile owner; org refs resolved via `OrganizationsService.findManyById`. CV-specific rendering in `resume/pdf/` (`renderResumeDocument`, section renderers); uses `PdfRenderService` from `core/pdf/PdfModule`.
- CRUD feature modules (`skills/`, `users/`, `experiences/`, `educations/`, `courses/`, `organizations/`, `projects/`): canonical skeleton:

```
modules/<entity>/
├── <entity>.module.ts
├── <entity>.resolver.ts
├── <entity>.service.ts
├── schemas/
├── entities/
├── dto/          # always *.input.ts (create, update, filter, sort)
├── enums/        # if GraphQL enums exist for this entity
└── listeners/    # only if consuming delete events from another domain
```

Notable specifics:

- `modules/users/users.service.ts`: hashes password on create; `findOneByEmailWithPassword` (with `select("+password")`) is auth-only — public CRUD methods never load password.
- `modules/experiences/experiences.resolver.ts`: `@ResolveField` for `organization`, `skills`, sorted `roles`.
- `modules/skills/` and `modules/organizations/` export `SkillsLoaderService` / `OrganizationsLoaderService`; `LoadersService` composes them per request.

## Domain events (delete cascade)

When a referenced resource is deleted, emitter services fire domain events **before** removing the document (`emitAsync`). Payload classes live in `core/events/`; consumers import from `core/`, never from the emitter module.

Listeners are thin (`@OnEvent` + delegate to a service method). All MongoDB writes stay in the consumer's service.

- `skill.deleted` (`skills` → `projects`): `$pull` from `skillIds` array via `detachSkill`
- `skill.deleted` (`skills` → `courses`): `$pull` from `skillIds` array via `detachSkill`
- `skill.deleted` (`skills` → `educations`): `$pull` from `skillIds` array via `detachSkill`
- `skill.deleted` (`skills` → `experiences`): `$pull` from nested `roles.skillIds` via `detachSkill`
- `organization.deleted` (`organizations` → `courses`): hard `deleteMany` via `purgeByOrganization`
- `organization.deleted` (`organizations` → `educations`): hard `deleteMany` via `purgeByOrganization`
- `organization.deleted` (`organizations` → `experiences`): hard `deleteMany` via `purgeByOrganization`

Do not use Mongoose `pre('deleteOne')` hooks — they miss `findByIdAndDelete` / `deleteMany`.

## The patterns to follow when extending

Copy `src/modules/skills/` and adapt:

1. Mongoose model: `src/modules/<name>/schemas/<name>.schema.ts` extending `BaseModel`.
2. GraphQL entity: `modules/<name>/entities/<name>.entity.ts` extending `BaseEntity`; export `Paginated<Name>Entity = createPaginatedModel(...)`.
3. Inputs: `Create`, `Update` (PartialType), `Filter` (`PartialType(PickType(Create, [...]))` — explicit whitelist; never `PartialType(Create)` wholesale), `Sort` (SortType factory).
4. Repository: `<entity>.repository.ts` extends `CrudRepository<T>` from `core/persistence/repositories/crud.repository.ts`. Catalog entities: `readonly stats: StatsRepository<T>` for dashboard. Owner-scoped entities: `readonly tenant: TenantScopedCrudRepository<T>` and `readonly tenantStats: TenantScopedStatsRepository<T>` (see ADR 001). Entity-specific queries (e.g. `UsersRepository.findOneByEmailWithPassword`) stay on the repository subclass.
5. Service: explicit CRUD methods delegating to `repository.tenant.*` for owner-scoped entities. `AuthContext` is **required** on every method — no `null`, no `*Unscoped` escape hatches. Batch mutations return `BatchEntity`-shaped `BatchCount` (`{ succeeded, failed }`). Domain logic (events, password hashing, `detachSkill`, `purgeByOrganization`) stays in the service; cascades use raw `repository.updateMany` / `repository.deleteMany`.
6. Resolver: explicit `@Query` / `@Mutation` methods; private entities — no `@Public()`, `@Auth() ctx: AuthContext` on every operation. Copy `courses.resolver.ts` once Course reference is complete.
7. Module: `MongooseModule.forFeature`, providers (include repository), export service if needed for loaders. Import in `app.module.ts`.

If other modules reference the new entity in arrays: add payload to `core/events/`, emit from `removeOne` / `removeMany`, add a service method in each consumer (e.g. `detachSkill`), and a thin listener that delegates to it.

For nested `@ResolveField`, use DataLoaders from `ctx.loaders`; add a `*LoaderService` in the entity module, export it, and wire it in `LoadersService`.

CRUD field names follow the skills convention: `findOneSkillById`, `findManySkills`, `createOneSkill`, etc. Check `src/schema.gql` for exact names.

## Environment variables

Loaded via `--env-file .env.development` / `.env.production` and `ConfigModule`. See `.env.example`.

- `DATABASE_URL` (required): MongoDB URI.
- `JWT_SECRET` (required): JWT signing secret.
- `HOST` (optional, default `0.0.0.0`), `PORT` (optional, default `8080`).
- `OPENROUTER_API_KEY`, `OPENROUTER_AI_MODELS`, `GITHUB_API_KEY`, `TAVILY_API_KEY` (required for the `ai-tools` module): read via `ConfigService`. `OPENROUTER_AI_MODELS` is a comma-separated list of model ids, tried in order; when one fails with a retryable error (503, overload, timeout, etc.), `OpenRouterService` tries the next.

## Scripts / commands

Run from `apps/api/` or via root `api:*` aliases: `dev`, `prod`, `build`, `start`, `seed`, `test`, `test:coverage`, `test:e2e`, `typecheck`, `lint`, `format`.

`npm run seed`: wipes profile collections and inserts faker dev data plus `alice@profile.info` / `alice.pass`, `bob@profile.info` / `bob.pass` (USER), and `admin@profile.info` / `pass.123` (SUPER_ADMIN).

- `GET /health`: Terminus health check with MongoDB ping.
- Test layout: `test/fixtures/` (shared builders — import `@test/fixtures/…` from unit specs), `test/config/` (Jest e2e config, setup/teardown), `test/support/` (Nest bootstrap + `TestAppModule`), `test/e2e/`, `test/integration/`. Path aliases: `@/*` → `src/`, `@test/*` → `test/` (Jest + `tsconfig.json`).
- ADRs in `apps/api/docs/adr/`. Multi-tenant: `001-multi-tenant-migration.md` (**Course** reference complete; next: Experience). Deferred work: `backlog.md`.

## Gotchas & notes

- **NestJS GraphQL resolver hot-reload:** changing a resolver method signature (`@Auth`, `@Args`, `@Context` order or count) under `nest start --watch` can leave **stale parameter-binding metadata** for that method only. Symptom: one query (e.g. `findManyEducations`) throws `Cannot read properties of null (reading 'userId')` in `toTenantScope`, while sibling entities with identical resolver shape work. **Do not refactor auth or param decorators until this is ruled out.** First step: **restart the API process** (stop `nr dev`, start again) or revert + clean restart. Compare `ROUTE_ARGS_METADATA` with a working resolver if unsure. Only change code if the error survives a full restart.
- `ValidationPipe` has `whitelist: true`: on `@InputType`, use `@RequiredField()` / `@OptionalField()` — never bare `@Field` (silently dropped). Both exist mainly to register the property with `class-validator` for whitelist; `@RequiredField` uses `@IsDefined()`, `@OptionalField` uses `@IsOptional()`. Stack `@Is*` when you need format validation.
- Regenerate `src/schema.gql` after type changes so admin codegen stays in sync. E2E/integration tests use in-memory schema (`autoSchemaFile: true` when `NODE_ENV=test`) so they never overwrite the committed file — `TestAppModule` omits `AiToolsModule` and would strip AI types if it wrote to disk.
- New public GraphQL fields need `@Public()` or they 401.
- Password is `select: false` and absent from `UserEntity`; never expose it in GraphQL.
- DataLoaders exist only for skills and organizations today.
- Startup log says "Playground" but `playground` is disabled; Apollo landing page is at `/graphql`.
- `app.controller.ts` exposes REST `GET /` for health/e2e smoke test.
