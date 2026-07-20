# @profile-info/api

> Context for AI agents working in the API package. Keep it accurate; an agent will trust it.

## Maintaining this rule

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file
and update `apps/api/README.md` when setup or run changes. Update `apps/api/docs/ER_MODEL.md`
when schemas, references, or delete behavior change.

## Overview

The NestJS GraphQL API for profile-info. It is code-first: GraphQL types are TypeScript classes with `@ObjectType` / `@InputType` / `@Field` decorators, and the schema is generated to `src/schema.gql`. Data lives in MongoDB via Mongoose. Every operation except `signIn` and `register` requires a JWT. The admin app is the only known client.

The source is a modular monolith with a strict dependency rule (`modules → platform → integrations → core → common`; `platform` imports `modules` for composition only; `common` imports nothing; `integrations` never import from `modules`). The top-level layers under `src/` are `common/` (pure TS), `core/` (cross-cutting NestJS infra), `integrations/` (external system adapters), `platform/` (transport composition — GraphQL wiring, DataLoader aggregation), and `modules/` (business domains).

Feature modules follow the same explicit CRUD pattern: resolver → service → repository (`CrudRepository` + mapper). Copy `src/modules/courses/` as the reference implementation.

## Architecture & flow

Entry point `src/main.ts`:

1. `NestFactory.create(AppModule)`.
2. `validationConfig(app)` installs a global `ValidationPipe` with `whitelist: true`, `transform: true`, and `stopAtFirstError: true`.
3. `await appConfig(app)` reads `PORT` (default 8080) and `HOST` (default `0.0.0.0`), enables CORS, and starts listening.

`src/app.module.ts` composition root (ordered: infra → GraphQL → domain):

- `EventEmitterModule.forRoot({ global: true })`.
- `ConfigModule.forRoot({ isGlobal: true })`.
- `AppCacheModule` — global Nest cache (in-memory TTL + LRU).
- `MongooseModule.forRootAsync` reads `DATABASE_URL`.
- `GraphqlModule` (`platform/graphql/graphql.module.ts`): wraps `GraphQLModule.forRootAsync` with `ApolloDriver`, schema at `src/schema.gql`, and per-request DataLoaders via `LoadersService`.
- Feature modules: `AuthModule`, CRUD entities, `DashboardModule` (read-only aggregation), `ResumeModule` (PDF export), `AiToolsModule`.

Request flow: Apollo → `GqlAuthenticationGuard` (unless `@Public()`) → `GqlAuthorizationGuard` → resolver → service → repository (`CrudRepository` + mapper) → Mongoose. Nested fields use `@ResolveField` + per-request DataLoaders. REST routes (e.g. `GET /resume.pdf`) skip GraphQL guards when `context.getType() !== "graphql"`.

## Data model (ER)

Full diagram and field detail: `apps/api/docs/ER_MODEL.md`.

- MongoDB via Mongoose; eight top-level collections (User, Skill, Organization, Experience, Education, Course, Project, ApiToken).
- Organization is referenced by Experience, Education, and Course; Skill is referenced by arrays on Experience, Education, Course, and Project.
- Deletes use domain events (`skill.deleted`, `organization.deleted`) for detach and purge; see ER doc for behavior.

## Core technologies

- **@nestjs/graphql + @nestjs/apollo**: code-first schema in `src/schema.gql`.
- **@nestjs/mongoose + mongoose**: models in `modules/*/schemas/`, registered per feature module.
- **@nestjs/jwt + passport**: global 8h JWT in `modules/auth/`.
- **@nestjs/event-emitter**: domain events on delete (see below).
- **bcryptjs**: password hashing in `users/users.service.ts`.
- **dataloader + lodash**: per-entity `*LoaderService` in feature modules (`skills`, `organizations`, `users`); `platform/graphql/loaders.service.ts` composes them per request (`batchSkills.forKey` / `batchOrganizations.forKey` for catalog resolve via `core/loaders/keyed-loader-cache.ts`, `batchUsers`).
- **class-validator / class-transformer**: input validation via global `ValidationPipe`.

## Module / directory breakdown

`common/` (pure TS, no NestJS/Mongoose/GraphQL imports):

- `helpers/`: `object.helper.ts` (`clearObject`), `object-id.helper.ts` (`assertValidObjectId`, `assertValidObjectIds`), `assert.helper.ts` (`assertReferencesExist`, `assertReferencesResolved` — throws `i18nKey("common.REFERENCES_NOT_FOUND")`), `daterange.helper.ts` (`sortDateRange`), `pick-translation.helper.ts` (`pickTranslation`), `format-period.helper.ts` (`formatPeriod`), `breakpoint.helper.ts`, `url.helper.ts` (`isWebpageUrl` via `mime-types`).
- `pdf/`: domain-agnostic PDFKit layer — `PdfContext`, `DEFAULT_PDF_THEME`, `PDF_SPACING` scale (`xs`–`block`), layout primitives in `layout/` (`renderSection`, `renderEntryBlock`, `renderLabeledLinks`). `renderEntryBlock` and `renderSection` measure content height and call `ensureBlockFits` so section titles and entry headers are not orphaned at page breaks; long descriptions and multi-entry sections still flow across pages.
- `i18n/locales.ts`: `Locale`, `LOCALES`, `normalizeLocale`, `localeFromAcceptLanguage` — app-owned **content** locales (entity `i18n[]`, resume PDF). Entity `i18n[].locale` is a free string (`@IsString` + `@IsNotEmpty` only). API error localization uses nestjs-i18n (see `core/i18n/`), not this helper.

`common` holds only generic primitives — it does **not** own integration contracts. Each capability boundary owns its own port (see `integrations/`).

`core/` (cross-cutting NestJS infra, domain-agnostic):

- `cache/app-cache.module.ts`: global Nest cache (`@nestjs/cache-manager` + `createKeyv` TTL/LRU) and exports `OrchestratorService`. Process-local today; swap `stores` for Redis later without changing callers.
- `execution/orchestrator.service.ts`: `run` + optional `cacheKey` — concurrency-limited tasks, Nest `CACHE_MANAGER`, in-flight coalescing (stampede). Provided by `AppCacheModule`.
- `i18n/app-i18n.module.ts`: wires `nestjs-i18n` (`AcceptLanguageResolver`, `fallbackLanguage: 'en'`, JSON catalogs under `src/i18n/{en,es,pt}/`). Does **not** write types at runtime. Regenerate `src/generated/i18n.generated.ts` (`I18nPath`) with `npm run i18n:types` after catalog changes. `I18nModule` registers its own middleware. **Single source of truth for API error copy:** the JSON catalogs (+ generated `I18nPath`). Throw sites use `i18nKey("…")` — no `*.messages.ts`. Entity `i18n[]` content locales stay in `common/i18n/locales.ts` (resume PDF, translations) and are separate from nestjs-i18n.
- `i18n/i18n.ts`: `i18nKey(key)` / `i18nKey(key, args)` for typed exception keys (autocomplete on `I18nPath`; args become `{ message, args }` for the filter); request-scoped `t(key, args?)` like i18next for non-exception copy. Outside a request, `t` returns the key.
- `persistence/`: generic MongoDB layer — `CrudRepository` + `CrudMapperInterface`, `StatsRepository`, `scoped(PersistenceScope)` / `global()` via `PersistenceScope` (`query` + `document` hooks). `persistence-error.mapper.ts` owns Mongo/Mongoose detection and maps recognized failures to Nest exceptions carrying persistence i18n keys (e.g. `"persistence.DUPLICATE"` with `{ field, value }` from `keyValue`, or `"persistence.DUPLICATE_GENERIC"`; CRUD misses use `{ resource }` / `{ id }`). Core: `noopScope` in `persistence-scope.helper.ts`. Factories: `tenantScope` in `tenant-scope.helper.ts`, `catalogScope` in `catalog-scope.helper.ts`. Scope resolution at repository boundary: `tenantCrud(ctx)` / `tenantStats(ctx)` or `catalogCrud(ctx)` / `catalogStats(ctx)` inline via `tenantPersistenceScope` / `catalogPersistenceScope` from `auth-context.helper.ts`.
- `events/`: `domain-events.ts` (event name constants), `skill-deleted.event.ts`, `organization-deleted.event.ts`, `user-deleted.event.ts` (neutral payload classes).
- `enums/credential-kind.enum.ts`: shared `CredentialKind` enum (`SESSION`, `API_TOKEN`).
- `enums/user-role.enum.ts`: shared `UserRole` enum (`USER`, `SUPER_ADMIN`).
- `enums/api-token-permission.enum.ts`: shared `ApiTokenPermission` enum (`QUERY`, `MUTATE`).
- `schemas/paginated.schema.ts`: `createPaginatedModel(Entity)` for `{ found, nodes }`.
- `schemas/base.schema.ts`, `translation.schema.ts`, `daterange.schema.ts`, `url.schema.ts`: shared Mongoose sub-schemas.
- `entities/`: `BaseEntity`, `BatchEntity` (`succeeded`, `failed`), date-range, translation, url GraphQL types.
- `inputs/`: pagination, sort factory, date-range, translation, url inputs.
- `decorators/`: `@RequiredField()`, `@OptionalField()` (GraphQL input validation only).
- `configs/`: `app.config.ts`, `validation.config.ts`.
- `context/`: `auth-context.interface.ts` (`AuthContextUser` with `id` + `role?`; `SessionAuthContext` / `ApiTokenAuthContext` extend it; `AuthContext` union), `auth-context.helper.ts` (`toSessionAuthContext`, `toTenantScope` maps `ctx.id` → `TenantScope.userId`, `hasPermission`, …). Service-layer auth contract — not GraphQL transport.
- `pdf/`: cross-cutting PDF infra — `PdfRenderService` (PDFKit document lifecycle → `Buffer`), `PdfModule`. Rendering primitives (context, theme, layout) live in `common/pdf/`. Import `PdfModule` from use-case modules that export PDFs.

`integrations/` (each owns its port — an **abstract class** used as the DI token — plus neutral types; map vendor types → neutral contracts; never import from `modules`):

- `open-router/`: OpenRouter adapter + AI port (`ai-chat.provider.ts`: `AiChatProvider` + loose `IntegrationChatResult`). `OpenRouterModule` binds port → `OpenRouterService`; mappers translate SDK ↔ integration DTO. Failures map to Nest `HttpException` + i18n keys (e.g. `"open-router.UNAUTHORIZED"`). Flat sibling of `tavily/`.
- `tavily/`: flat. Owns `web-content.provider.ts` (abstract `WebContentProvider` + extract types) and `web-search.provider.ts` (abstract `WebSearchProvider` + search types); `TavilyService implements WebContentProvider, WebSearchProvider` (vendor `Tavily*` types stay inside the adapter); `tavily.module.ts` binds both via `useExisting: TavilyService`. Failures map to Nest `HttpException` + i18n keys (e.g. `"tavily.PROVIDER_FAILURE"`). See ADR 004 (`apps/api/docs/adr/004-generic-tavily-context.md`).
- `sentry/`: error-monitoring port (`error-monitoring.provider.ts`: abstract `ErrorMonitoringProvider` + `IntegrationErrorContext`) + `SentryService` adapter. `SentryModule` binds `{ provide: ErrorMonitoringProvider, useClass: SentryService }` (same shape as `OpenRouterModule`). SDK inits when `SENTRY_DSN` is set (any env except `test`); omit the key to disable. Mappers: `scrub-sentry-event`, `apply-error-context`. Platform `ApiExceptionFilter` reports via the port when resolved status is ≥ 500. `GET /sentry-test` throws when DSN is set (404 otherwise) to verify capture.
- `resend/`: email-delivery port (`email.provider.ts`: abstract `EmailProvider` + `IntegrationEmailMessage` / `IntegrationEmailResult`) + `ResendService` adapter. `ResendModule` binds `{ provide: EmailProvider, useExisting: ResendService }` and is imported in `AppModule`. `RESEND_API_KEY` presence enables the client; omit to disable — `send()` then throws `ServiceUnavailableException` (fail-loud, not a no-op). `EMAIL_FROM` is the default sender when the message omits `from`. Mappers: `resend-request`, `resend-result`, `resend-error` (vendor → Nest `HttpException` + i18n keys). Neutral `send({ to, subject, html?, text?, from?, replyTo? })` only — templates and event-driven mail are backlog.

DI pattern is the NestJS-idiomatic **abstract class as token**: ports are abstract classes (no `Symbol`, no `@Inject()`); modules bind `{ provide: Port, useClass: Impl }` and consumers inject the port by type. A service implementing a port `extends` it and must call `super()` in its constructor.

**Integration errors:** adapters map vendor failures to Nest `HttpException` carrying an owner i18n key from the JSON catalogs (typed as `I18nPath`), same idea as persistence’s mapper. Do not throw bare `Error` from an integration — `ApiExceptionFilter` would collapse it to `common.UNEXPECTED`.

`platform/` (transport composition — may import `modules/`; not a business domain):

- `errors/api-exception.filter.ts`: the only global `APP_FILTER`. It preserves known Nest status codes, asks infrastructure mappers to normalize foreign errors, translates the thrown key via `I18nService` (lang from nestjs-i18n `I18nContext`, else module `fallbackLanguage`), reports resolved status ≥ 500 through `ErrorMonitoringProvider`, and falls back to `common.UNEXPECTED` for unknown or untranslated messages. Throw via `i18nKey("…")` or `i18nKey("…", args)`; the filter is the only translator for API errors. Do not re-parse `Accept-Language` here — that belongs to nestjs-i18n resolvers.
- `graphql/`: `graphql.module.ts` (Apollo `forRootAsync`, `formatError` strips stacktrace in production), `loaders.service.ts` (loader composition), `loaders.registry.ts` (augments `AppLoaders` on `core/context/graphql-context.interface`). Batching logic stays in each entity's `*LoaderService`.

`modules/` (business domains):
- `auth/`: `strategies/` (`JwtStrategy`, `ApiTokenStrategy`), `guards/` (`GqlAuthenticationGuard`, `GqlAuthorizationGuard`), `decorators/` (`@Auth`). Session: `Authorization: Bearer <jwt>`. API token: `X-Api-Key: pi_…`.
- `ai-tools/`: AI use-cases (`atsSummarize`, `summarize`, `translate`). Any authenticated user (JWT); `@Roles(SUPER_ADMIN)` removed in phase 5b. `GqlThrottlerGuard` tracks throttle by `userId`; `@Throttle({ default: { limit: 5, ttl: 60_000 } })` on resolver (app `ThrottlerModule` default is 10/min) — see ADR 003 (`apps/api/docs/adr/003-platform-ai-throttle.md`). Owns `AiEntity` GraphQL types, enums (`ChatRole`, `ChatFinishReason`, `ContextMode`), and mappers (`IntegrationChatResult` → `AiEntity`; web results → `DetailInput`). `AiToolsService` injects only module collaborators: `ChatService` (`AiChatProvider` → `AiEntity`) and `ContextService` (`enrichFromDetails` — `CONTEXT_FALLBACK_ORDER`: extract then search; `isWebpageUrl`; parallel tasks via `OrchestratorService.run({ cacheKey })`). Tavily output is **context for summarizing user `raw`**, not a product to re-summarize. Never imports `integrations/` from `AiToolsService`. Layers + cost controls: ADR 004. Deferred (Redis, opt-in web toggle, etc.): `docs/BACKLOG.md`.
- `dashboard/`: read-only aggregation via feature **services**. `@Auth() ctx` on `dashboard` query. Private entities: `count(ctx)` / `countByField(ctx)` / `findRecentActivity(ctx)` (tenant-scoped). Catalog (`skills`, `organizations`): `count(ctx)` / `findRecentActivity(ctx)` via `catalogStats(ctx)` (scoped: GLOBAL + own LOCAL for USER; all rows for SUPER_ADMIN). USER sees own private totals + scoped catalog; `SUPER_ADMIN` sees all private data (`crossTenant`) and full catalog. Recent activity returns `slug` + title `i18n` for client-side `i18nLabel`, same idea as admin tables.
- `resume/`: `ResumeService.buildResume(userId, locale)` aggregates one user's profile (top by `relevance`, completed educations/courses); skills section uses ordered `user.skillIds` with localized display via `resolveSkillTitle` / `pickTranslation` (`i18n.messages.title`, fallback `slug`). PDF export via public `GET /resume.pdf?userId=&locale=` (`normalizeLocale`, `pickTranslation`, `formatPeriod`, `resolveResumeLabels(i18n, locale)` from nestjs-i18n `resume.*` catalogs in `const/resume-labels.const.ts`). Filename is always `resume.pdf`. Private entities use owner-scoped `ctx` for the requested `userId` (forced `USER` role so `SUPER_ADMIN` profiles do not pull cross-tenant data). Org refs resolved via `OrganizationsService.findManyById`. CV-specific rendering in `resume/pdf/` (`renderResumeDocument`, section renderers); uses `PdfRenderService` from `core/pdf/PdfModule`.
- CRUD feature modules (`skills/`, `users/`, `api-tokens/`, `experiences/`, `educations/`, `courses/`, `organizations/`, `projects/`): canonical skeleton:

```
modules/<entity>/
├── <entity>.module.ts
├── <entity>.resolver.ts
├── <entity>.service.ts
├── <entity>.repository.ts
├── mappers/
│   └── <entity>.mapper.ts
├── schemas/
├── entities/
├── dto/          # always *.input.ts (create, update, filter, sort)
├── enums/        # if GraphQL enums exist for this entity
└── listeners/    # only if consuming delete events from another domain
```

Notable specifics:

- `modules/users/users.service.ts`: hashes password on create; `findOneByEmailWithPassword` (with `select("+password")`) is auth-only and returns `null` when missing — public CRUD methods never load password. Password validation lives in `AuthService.validate` (missing user / bad password both → `UnauthorizedException`). Public `register` creates `USER` rows with `disabled: true`; `createOneUser` / `createManyUsers` create enabled accounts. `UsersValidatorService.assertUserEnabled` blocks `signIn`, JWT, and API-token auth for disabled users with `UnauthorizedException("users.ACCOUNT_DISABLED")` (filter translates via nestjs-i18n). `SUPER_ADMIN` enables via `updateOneUser { disabled: false }`. Filter-based user reads (`findOneUser`, `findManyUsers`) and user mutations require `SUPER_ADMIN`; `findOneUserById` / `findManyUserById` stay auth-only (resume uses the service `findOneById`, not GraphQL).
- `modules/api-tokens/api-tokens.service.ts`: hashes secret on create; `findOneByIdWithHashedSecret` (with `select("+hashedSecret")`) is auth-only — public CRUD methods never load `hashedSecret`. Credential validation (parse, expiry, bcrypt compare) lives in `ApiTokenStrategy.validate`; `parseApiToken` is shared with create formatting.
- `modules/experiences/experiences.resolver.ts`: `@ResolveField` for `organization`, `skills`.
- `modules/skills/` and `modules/organizations/` export loader and validator services. **Catalog (ADR 001):** browse = caller `ctx` (`findMany*` / `findOne*` vs `*Active*`); resolve stored refs via owner-scoped loaders (`forKey(parent.ownerId)`, disabled included); validate writes via `assert*Enabled`. Principles only — `apps/api/docs/adr/001-local-catalog.md`.
- **Catalog** (`skills`, `organizations`): `partition` (`GLOBAL` | `LOCAL`); `ownerId` on every row (server-assigned on create). Unique `{ partition, ownerId, slug }`. **Skill:** slug + `i18n[].messages.title`. **Organization:** root `name` + `i18n[].messages.description`. `disable*` / `enable*` without domain events; `remove*` hard delete + cascade events. **Admin UI:** GLOBAL → enable/disable; LOCAL → remove (`catalog-mutation-access.ts`). E2e scope: `test/e2e/skills-catalog-scope.spec.ts`, `test/e2e/organizations-catalog-scope.spec.ts`, `test/e2e/catalog-batch-edge.spec.ts`, `test/e2e/catalog-loaders-dashboard.spec.ts`; integration: `test/integration/catalog-local-delete-cascade.spec.ts`, `test/integration/user-delete-local-catalog-purge.spec.ts`.

## Domain events (delete cascade)

When a referenced resource is deleted, emitter services fire domain events **before** removing the document (`emitAsync`). Payload classes live in `core/events/`; consumers import from `core/`, never from the emitter module.

Listeners are thin (`@OnEvent` + delegate to a service method). All MongoDB writes stay in the consumer's service.

- `skill.deleted` (`skills` → `projects`): `$pull` from `skillIds` array via `detachSkill`
- `skill.deleted` (`skills` → `courses`): `$pull` from `skillIds` array via `detachSkill`
- `skill.deleted` (`skills` → `educations`): `$pull` from `skillIds` array via `detachSkill`
- `skill.deleted` (`skills` → `experiences`): `$pull` from `skillIds` array via `detachSkill`
- `skill.deleted` (`skills` → `users`): `$pull` from `skillIds` array via `detachSkill`
- `organization.deleted` (`organizations` → `courses`): hard `deleteMany` via `purgeByOrganization`
- `organization.deleted` (`organizations` → `educations`): hard `deleteMany` via `purgeByOrganization`
- `organization.deleted` (`organizations` → `experiences`): hard `deleteMany` via `purgeByOrganization`
- `user.deleted` (`users` → `experiences`, `educations`, `courses`, `projects`): hard `deleteMany` via `purgeByOwner`
- `user.deleted` (`users` → `api-tokens`): hard `deleteMany` via `purgeByOwner`
- `user.deleted` (`users` → `skills`, `organizations`): hard `deleteMany` of `partition: LOCAL` via `purgeLocalByOwner` (GLOBAL untouched)

Do not use Mongoose `pre('deleteOne')` hooks — they miss `findByIdAndDelete` / `deleteMany`.

## The patterns to follow when extending

Copy `src/modules/courses/` (or `educations/`) and adapt:

1. Mongoose model: `src/modules/<name>/schemas/<name>.schema.ts` extending `BaseModel`.
2. GraphQL entity: `modules/<name>/entities/<name>.entity.ts` extending `BaseEntity`; export `Paginated<Name>Entity = createPaginatedModel(...)`. When the entity has `@ResolveField` relations, define `<Name>EntityRecord` (`Omit<Entity, resolved fields>`) for mapper/repository typing.
3. Mapper: `modules/<name>/mappers/<name>.mapper.ts` implementing `CrudMapperInterface` — `toDomain`, `toPersistenceForCreate/Update/Filter/Sort`; use `toObjectId` / `toObjectIds` from `core/mappers/base.mapper` for refs in create, update, and filter (`withObjectIdRefs` from `core/persistence/helpers/filter-ref.helper`). Both helpers call `assertValidObjectId(s)` before constructing `ObjectId`. `toObjectIds` preserves GraphQL semantics: `undefined` = omit / no change, `null` = clear the field (admin `nullIfEmpty`), array = convert.
4. Inputs: `Create`, `Update` (PartialType), `Filter` (`PartialType(PickType(Create, [...]))` — explicit whitelist; never `PartialType(Create)` wholesale), `Sort` (SortType factory).
5. Repository: `<entity>.repository.ts` — `private readonly crud` / `private readonly stats`; expose `tenantCrud(ctx)` / `tenantStats(ctx)` or `catalogCrud(ctx)` / `catalogStats(ctx)` with inline `scoped(tenantPersistenceScope(ctx))` / `scoped(catalogPersistenceScope(ctx))`. Cascade helpers (`detachSkill`, `purgeByOrganization`) use raw `model` when needed. Entity-specific queries (e.g. `UsersRepository.findOneByEmailWithPassword`) stay on the repository class.
6. Service: explicit CRUD methods delegating to `repository.tenantCrud(ctx)` / `repository.tenantStats(ctx)` for owner-scoped entities. **Catalog** (`skills`, `organizations`): scoped via `catalogCrud(ctx)`; browse vs active vs validate per ADR 001 — see `apps/api/docs/adr/001-local-catalog.md`. Error copy: add strings under `src/i18n/{en,es,pt}/<namespace>.json`, then `npm run i18n:types`. Throw: `i18nKey("namespace.KEY")` — filter translates. Elsewhere in a request: `t("namespace.KEY")` / `t("…", args)`.
7. Resolver: explicit `@Query` / `@Mutation` methods; private entities — no `@Public()`, `@Auth() ctx: AuthContext` on every operation. Copy `courses.resolver.ts`.
8. Module: `MongooseModule.forFeature`, providers (include repository), export service if needed for loaders. Import in `app.module.ts`.

If other modules reference the new entity in arrays: add payload to `core/events/`, emit from `removeOne` / `removeMany`, add a service method in each consumer (e.g. `detachSkill`), and a thin listener that delegates to it.

For nested `@ResolveField`, use DataLoaders from `ctx.loaders`; add a `*LoaderService` in the entity module, export it, and wire it in `platform/graphql/loaders.service.ts`.

CRUD field names follow the skills convention: `findOneSkillById`, `findManySkills`, `createOneSkill`, etc. Check `src/schema.gql` for exact names.

## Environment variables

Loaded via `--env-file .env.development` / `.env.production` and `ConfigModule`. See `.env.example`.

- `DATABASE_URL` (required): MongoDB URI.
- `JWT_SECRET` (required): JWT signing secret.
- `HOST` (optional, default `0.0.0.0`), `PORT` (optional, default `8080`).
- `GRAPHQL_INTROSPECTION` (required, `true` | `false`): Apollo Sandbox schema introspection. Set `true` in development; `false` in production unless you explicitly want the public schema explorer.
- `OPENROUTER_API_KEY`, `OPENROUTER_AI_MODELS`, `TAVILY_API_KEY` (required for the `ai-tools` module): read via `ConfigService`. `OPENROUTER_AI_MODELS` is a comma-separated list of model ids, tried in order; on any failure (unavailable, paid-only, rate limit, token budget, timeout, etc.) `OpenRouterService` tries the next model and only throws after the last one fails. Exception: OpenRouter **401 / auth** errors stop immediately via `isOpenRouterAuthError` (same API key; another model cannot recover).
- `SENTRY_DSN` (optional): Sentry project DSN. **Presence enables Sentry** in development and production; omit the key to disable. Ignored when `NODE_ENV=test`.
- `RESEND_API_KEY` (optional): Resend API key. **Presence enables email delivery**; omit the key to disable. Calling `EmailProvider.send` without a key throws `ServiceUnavailableException`.
- `EMAIL_FROM` (optional): Default sender address (or `"Name <email@domain.com>"`) used when a message does not set `from`. Required at send time if the message also omits `from`.
## Scripts / commands

Run from `apps/api/` or via root `api:*` aliases: `dev`, `prod`, `build`, `start`, `seed`, `test`, `test:coverage`, `test:e2e`, `typecheck`, `lint`, `format`.

`npm run seed`: wipes profile collections and inserts faker dev data plus personas (`empty`, `joao`, `maria`, `full`, `pending`, `admin` @ `profile.info`, password `123123`). Deterministic via `initSeedFakers()` (`en` + `pt_BR` streams, `FAKER_SEED` in `constants.ts`). Entry: `apps/api/seed/index.ts` (excluded from Nest build). Entity `i18n` differs per locale (skills use locale-specific job titles). GLOBAL catalog owned by admin; USER personas get LOCAL skills/orgs (first LOCAL row per persona forced `disabled` for picker QA). `pending` is `disabled: true` (approval-queue QA; sign-in rejected). Logs fixed dev API tokens (`pi_…`, including admin QUERY + an expired joão token) — send as `X-Api-Key` header. Full matrix: `apps/api/seed/README.md`.

- `GET /health`: Terminus health check with MongoDB ping.
- Test layout: `test/fixtures/` (shared builders — import `@test/fixtures/…` from unit specs), `test/config/` (Jest e2e config, setup/teardown), `test/support/` (Nest bootstrap + `TestAppModule`), `test/e2e/` (includes `user-registration`, `users-admin`, `disabled-user-auth`), `test/integration/`. Path aliases: `@/*` → `src/`, `@test/*` → `test/` (Jest + `tsconfig.json`).

## Gotchas & notes

- **NestJS GraphQL resolver hot-reload:** changing a resolver method signature (`@Auth`, `@Args`, `@Context` order or count) under `nest start --watch` can leave **stale parameter-binding metadata** for that method only. Symptom: one query (e.g. `findManyEducations`) throws `Cannot read properties of null (reading 'userId')` in `toTenantScope`, while sibling entities with identical resolver shape work. **Do not refactor auth or param decorators until this is ruled out.** First step: **restart the API process** (stop `nr dev`, start again) or revert + clean restart. Compare `ROUTE_ARGS_METADATA` with a working resolver if unsure. Only change code if the error survives a full restart.
- Nest GraphQL does **not** run `APP_GUARD`s on `@ResolveField` unless `fieldResolverEnhancers: ['guards']` is set — and enabling that re-runs Passport JWT on nested fields and breaks. Do **not** enable `guards` there. `fieldResolverEnhancers: ['filters']` is set so `ApiExceptionFilter` localizes Nest exceptions from field resolvers (e.g. `ownedCounts` → `ForbiddenException(i18nKey(...))`).
- **Tenant `countByField` / aggregate:** `toQueryForRead` uses string `ownerId` for `find`/`countDocuments` (Mongoose casts). `toQueryForAggregate` uses `toObjectId(scope.userId)` (`assertValidObjectId` + `ObjectId`) for `$match` — aggregation does not cast strings. Scope helpers validate `scope.userId` on read/mutate/create paths too.
- `ValidationPipe` has `whitelist: true`: on `@InputType`, use `@RequiredField()` / `@OptionalField()` — never bare `@Field` (silently dropped). Both exist mainly to register the property with `class-validator` for whitelist; `@RequiredField` uses `@IsDefined()`, `@OptionalField` uses `@IsOptional()`. Stack `@Is*` when you need format validation.
- Regenerate `src/schema.gql` after type changes so admin codegen stays in sync. E2E/integration tests use in-memory schema (`autoSchemaFile: true` when `NODE_ENV=test`) so they never overwrite the committed file — `TestAppModule` omits `AiToolsModule` and would strip AI types if it wrote to disk.
- New public GraphQL fields need `@Public()` or they 401.
- Password is `select: false` and absent from `UserEntity`; never expose it in GraphQL.
- DataLoaders today: skills and organizations are **owner-scoped** (`batchSkills.forKey` / `batchOrganizations.forKey` — forced `USER` session ctx for GLOBAL + that owner’s LOCAL); users (`UsersLoaderService`: `batchUsers` for `owner` on ApiToken/private entities; `batchUserOwnedCounts` for `UserEntity.ownedCounts`, SUPER_ADMIN only).
- Private entity services expose `countByOwners` → `StatsRepository.countByOwnerIds` (global aggregate by `ownerId`). Consumed by `UsersLoaderService.createOwnedCountsLoader()` for the SUPER_ADMIN users list.
- Startup log says "Playground" but `playground` is disabled; Apollo landing page is at `/graphql`. Introspection follows `GRAPHQL_INTROSPECTION` in env.
- `app.controller.ts` exposes REST `GET /` for health/e2e smoke test.
