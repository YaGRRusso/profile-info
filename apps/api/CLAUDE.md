# CLAUDE.md: @profile-info/api

> Context for AI agents working in this codebase. Keep it accurate; an agent will
> trust it.

## Maintaining this file

This is a living document. If you are an AI agent working in this repo and you
learn something worth knowing next time, update this file in the same session.
Things worth recording: a non-obvious architecture or wiring detail, a stated
user preference, a useful command, a gotcha, or a new folder, resource, or module
that isn't mapped here yet. Record only what a future session would be glad to
find already written down. Do not add generic or obvious facts, do not restate
what the code makes plain, and do not duplicate what's already here. Keep edits
small and put them in the section they belong to.

## Overview

The NestJS GraphQL API for profile-info. It is code-first: GraphQL types are
TypeScript classes with `@ObjectType` / `@InputType` / `@Field` decorators, and
the schema is generated to `src/schema.gql`. Data lives in MongoDB via Mongoose.
Every operation except `signIn` requires a JWT. The admin app is the only known
client. The defining trait of this codebase is that almost every feature module is
a thin shell over two generic factories (`BaseResolver`, `BaseService`), so the
CRUD surface for an entity is generated rather than hand-written.

## Architecture & flow

Entry point `src/main.ts`:

1. `NestFactory.create(AppModule)`.
2. `validationConfig(app)` (`core/configs/validation.config.ts`) installs a global
   `ValidationPipe` with `stopAtFirstError: true`.
3. `await appConfig(app)` (`core/configs/app.config.ts`) reads `PORT` (default 8080) and `HOST` (default `0.0.0.0`), enables CORS for `localhost:*` and
   `https://yagrrusso.github.io`, and starts listening. It logs the GraphQL URL.

`src/app.module.ts` composition root:

- `ConfigModule.forRoot({ isGlobal: true })`.
- `MongooseModule.forRootAsync` reads `DATABASE_URL` from `ConfigService`, with
  3s server-selection and connect timeouts.
- `GraphQLModule.forRootAsync` with `ApolloDriver`: `autoSchemaFile` at
  `src/schema.gql`, `sortSchema: true`, `introspection: true`, `playground: false`,
  and the Apollo local landing page plugin. Its `useFactory` injects
  `SkillsService` and `OrganizationsService` so it can build the DataLoaders in the
  per-request `context` (`createLoaders(...)`).
- Feature modules: `SkillsModule`, `ProjectsModule`, `UsersModule`, `AuthModule`,
  `CoursesModule`, `EducationsModule`, `ExperiencesModule`, `OrganizationsModule`.

Request flow for a query: Apollo receives the operation, the global `GqlAuthGuard`
checks the JWT (unless the field is `@Public()`), the resolver method (usually
inherited from `BaseResolver`) calls the service (usually inherited from
`BaseService`), which uses the injected Mongoose model. Nested object fields on
experiences are resolved with `@ResolveField` using the per-request DataLoaders.

## Core technologies and where they live

- **@nestjs/graphql + @nestjs/apollo (code-first)**: `app.module.ts`. Schema output
  is `src/schema.gql`. There is no hand-written `.graphql` schema.
- **@nestjs/mongoose + mongoose**: connection in `app.module.ts`; per-entity models
  registered with `MongooseModule.forFeature` in each feature module; schema classes
  in `src/schemas/`.
- **@nestjs/jwt + passport + passport-jwt**: `src/auth/`. `JwtModule.register` is
  global with `expiresIn: "8h"`, secret from `JWT_SECRET`.
- **bcryptjs**: password hashing in `src/users/users.service.ts`.
- **dataloader + lodash**: `src/core/helpers/loaders.helper.ts` (uses `keyBy`).
- **class-validator / class-transformer**: validation on input DTOs, enforced by
  the global `ValidationPipe`.
- **chalk**: colored startup log in `app.config.ts`.

## Module / directory breakdown

`core/` (shared, depended on by every feature):

- `resolvers/base.resolver.ts`: a function `BaseResolver(Entity, CreateInput,
UpdateInput, FilterInput, SortInput)` that returns an abstract resolver class
  with the full CRUD surface. A feature resolver extends the returned class and
  passes its service to `super(...)`.
- `services/base.service.ts`: `BaseService(Model, CreateInput, UpdateInput)` with
  `findOneById`, `findOne`, `findManyById`, `findMany` (pagination + sort),
  `createOne`, `createMany`, `updateOne`, `updateMany`, `removeOne`, `removeMany`.
- `schemas/base.schema.ts`: `BaseModel` Mongoose base (`id`, `createdAt`,
  `updatedAt`, `timestamps: true`). `paginated.schema.ts` wraps a model in a
  `{ found, nodes }` shape. `translation.schema.ts` and `daterange.schema.ts` are
  reusable embedded sub-schemas.
- `entities/base.entity.ts`: `BaseEntity` GraphQL type (`id`, `createdAt`,
  `updatedAt`). Other shared object types: batch, date-range, translation, url.
- `inputs/`: `pagination.input.ts` (`skip`, `limit` capped at 50),
  `sort.input.ts` (`SortType(Entity, [fields])` factory), date-range, translation,
  url inputs.
- `decorators/`: `@Public()` (sets metadata the guard reads), `@CurrentUser()`
  (pulls `req.user` out of the GraphQL context), `@OptionalField()` (combines
  `@IsOptional()` with a nullable `@Field`).
- `helpers/loaders.helper.ts`: `createLoaders({ skillsService,
organizationsService })` returns `batchSkills` and `batchOrganizations`
  DataLoaders (max batch 100), used in the GraphQL context.
- `interfaces/context.interface.ts`: `Ctx` = `{ loaders, req, res }`.
- `configs/`: `app.config.ts` and `validation.config.ts` (described above).

`auth/`:

- `auth.module.ts`: registers `JwtModule` (global, 8h), provides `AuthService`,
  `AuthStrategy`, and registers `GqlAuthGuard` as `APP_GUARD` (global guard).
- `auth.resolver.ts`: `signIn` (`@Public`, `@Mutation(() => String)`) returns the
  JWT string; `getMe` (`@Query`) returns the `@CurrentUser()`.
- `auth.service.ts`: `signIn` validates email + password (bcrypt compare via the
  users service) and signs `{ sub: user.id, role: user.role }`.
- `auth.strategy.ts`: extracts the Bearer token, verifies with `JWT_SECRET`, and
  loads the user by `payload.sub`; throws `UnauthorizedException` if missing.
- `auth.guard.ts`: `GqlAuthGuard extends AuthGuard("jwt")`; short-circuits to
  allow when `@Public()` metadata is present; overrides `getRequest` to read the
  Express request out of the GraphQL execution context.

Feature modules (`skills/`, `users/`, `experiences/`, `educations/`, `courses/`,
`organizations/`, `projects/`): each has `<name>.module.ts`, `<name>.resolver.ts`,
`<name>.service.ts`, `entities/<name>.entity.ts`, `dto/` (create / update / filter
/ sort inputs), and often `enums/`. The matching Mongoose model lives in
`src/schemas/<name>.schema.ts`.

Notable feature specifics:

- `users/users.service.ts` overrides base methods to hash the password with
  `bcryptjs` on create and to `select("+password")` when validating, because the
  password field is `select: false` in the schema and is never exposed in GraphQL.
- `experiences/experiences.resolver.ts` adds `@ResolveField` methods for
  `organization` (single, via `batchOrganizations`) and `skills` (collected across
  the experience roles, via `batchSkills`).
- `organizations/` exports its service so `app.module.ts` can inject it into the
  GraphQL DataLoader factory; `skills/` does the same.

## The patterns to follow when extending

To add a new profile entity, copy `src/skills/` and adapt. Concretely:

1. Mongoose model: add `src/schemas/<name>.schema.ts` extending `BaseModel`, with
   `@Prop` fields and `export const <Name>Schema = SchemaFactory.createForClass(...)`.
2. GraphQL entity: `<name>/entities/<name>.entity.ts` extending `BaseEntity` with
   `@ObjectType()` and `@Field()` columns. Use `@OptionalField()` for nullable ones.
3. Inputs in `<name>/dto/`: `Create<Name>Input` (`@InputType`),
   `Update<Name>Input extends PartialType(Create...)`, `Filter<Name>Input extends
PartialType(Create...)`, `Sort<Name>Input extends SortType(<Name>Entity,
[sortableFields])`.
4. Service: `<name>/<name>.service.ts` extends `BaseService(<Name>Model,
Create<Name>Input, Update<Name>Input)`, injecting the model with `@InjectModel`.
5. Resolver: `<name>/<name>.resolver.ts` extends `BaseResolver(<Name>Entity,
...the four inputs)` and passes the service to `super(...)`.
6. Module: register the model with `MongooseModule.forFeature`, provide the
   resolver and service, export the service if other modules need it. Import the
   module in `app.module.ts`.

The CRUD field names are derived from the entity name by the factory (for skills:
`findOneSkillById`, `findManySkills`, `createOneSkill`, `updateManySkills`,
`removeOneSkill`, etc.). Check `src/schema.gql` for the exact generated names.

For a field that resolves a referenced document, add a `@ResolveField` to the
resolver and load it through a DataLoader from `ctx.loaders`. If you reference a
new collection that needs batching, add a loader in `core/helpers/loaders.helper.ts`
and inject that service into the GraphQL factory in `app.module.ts`.

## Conventions & standards

- Lint/format: Biome via ultracite (`biome.jsonc` at the repo root). Run
  `npm run lint` (`biome check .`) and `npm run format` (`biome format --write .`).
- Types: extends `tsconfig.base.json` (`strictNullChecks: true`). This package sets
  `noImplicitAny: false` and `strictBindCallApply: false`, and enables
  `emitDecoratorMetadata` / `experimentalDecorators` (required by Nest decorators).
  `noExplicitAny` is a Biome warning, not an error, in this repo.
- Path alias: `@/*` maps to `src/*` (in `tsconfig.json` and the Jest
  `moduleNameMapper`).
- Naming: kebab-case files with role suffixes (`*.resolver.ts`, `*.service.ts`,
  `*.schema.ts`, `*.entity.ts`, `*.input.ts`, `*.enum.ts`, `*.decorator.ts`).
- Architecture: feature-module layered structure (resolver to service to Mongoose
  model), with generic base classes supplying the repeated CRUD logic.
- Testing: Jest. Unit specs are co-located as `*.spec.ts` (services have specs:
  auth, base.service, and each feature service). E2e specs are `test/*.e2e-spec.ts`
  with config `test/jest-e2e.json`. The unit Jest config is inline in
  `package.json` and uses `tsconfig.test.json`.

## Directory map

```
apps/api/
├── nest-cli.json             # Nest CLI: sourceRoot src, deleteOutDir on build.
├── tsconfig.json             # Extends base; @/* -> src/*; nodenext; ES2023.
├── tsconfig.build.json       # Build-only excludes.
├── tsconfig.test.json        # Used by ts-jest.
├── .env.example              # DATABASE_URL, JWT_SECRET, HOST, PORT.
├── src/
│   ├── main.ts               # Bootstrap.
│   ├── app.module.ts         # Composition root.
│   ├── app.controller.ts     # GET / -> "Hello World!".
│   ├── app.service.ts
│   ├── schema.gql            # Generated GraphQL schema (committed).
│   ├── auth/                 # JWT auth (module, resolver, service, strategy, guard).
│   ├── core/                 # Base classes, decorators, inputs, loaders, configs.
│   ├── skills/               # Feature module (reference example).
│   ├── users/                # Feature module; password hashing.
│   ├── experiences/          # Feature module; @ResolveField + DataLoaders.
│   ├── educations/           # Feature module; academic degrees (level enum).
│   ├── courses/              # Feature module; free courses/bootcamps/certs (type enum).
│   ├── organizations/        # Feature module; service exported for loaders.
│   ├── projects/             # Feature module.
│   └── schemas/              # Mongoose models for the feature entities.
└── test/
    ├── jest-e2e.json
    └── app.e2e-spec.ts       # GET / returns 200 "Hello World!".
```

## Environment variables

Loaded from `.env.development` / `.env.production` via the `--env-file` flag in the
`dev` / `prod` scripts, and through `ConfigModule` (global). Example values are in
`.env.example`.

- `DATABASE_URL` (required): MongoDB connection URI. Read via `ConfigService` in
  `app.module.ts` (Mongoose factory). Example: `mongodb://localhost:27017/profile`.
- `JWT_SECRET` (required): signing/verification secret. Read in `auth/auth.module.ts`
  (`JwtModule.register`) and `auth/auth.strategy.ts`.
- `HOST` (optional, default `0.0.0.0`): bind host. Read in `core/configs/app.config.ts`.
- `PORT` (optional, default `8080`): listen port. Read in `core/configs/app.config.ts`.

## Scripts / commands

Run from `apps/api/` or via the root `api:*` aliases.

- `npm run dev`: `nest start --watch --env-file .env.development`.
- `npm run prod`: same in watch mode with `.env.production`.
- `npm run build`: `nest build`.
- `npm run start`: `node --max-old-space-size=512 dist/main` (runs a prior build).
- `npm run seed`: runs `src/seed.ts` via `ts-node`/`tsconfig-paths` with
  `--env-file .env.development`. Boots a `NestFactory.createApplicationContext(AppModule)`,
  resolves the Mongoose models by token, **wipes** the profile collections, and inserts a
  `@faker-js/faker`-generated dev dataset — skills + organizations first, then
  courses/educations/projects/experiences that reference random subsets of their `_id`s,
  plus an admin user `admin@profile.info` / `admin123`. Idempotent (clear-then-insert);
  dev-only; `@faker-js/faker` is a devDependency. Excluded from `nest build` via
  `tsconfig.build.json`. Root alias: `npm run api:seed`.
- `npm run test` / `test:watch` / `test:cov`: Jest unit tests.
- `npm run test:e2e`: Jest with `test/jest-e2e.json`.
- `npm run typecheck`: `tsc -b --noEmit`.
- `npm run lint`: `biome check .`. `npm run format`: `biome format --write .`.

## Gotchas & notes

- `src/schema.gql` is auto-generated at boot/build but is committed, because the
  admin's codegen reads it from disk. After changing types, run the API or
  `npm run api:build` to refresh it, or the admin will codegen against a stale schema.
- The global `GqlAuthGuard` protects everything. New public fields must be marked
  with `@Public()` or they will 401. `signIn` is the only public field today.
- The password field is `select: false` and absent from `UserEntity`; the users
  service explicitly re-selects it for auth. Do not add it to the GraphQL entity.
- DataLoaders exist only for skills and organizations. A new nested reference (for
  example an education's organization) will N+1 unless you add a loader and wire
  the owning service into the GraphQL factory in `app.module.ts`.
- The startup log calls the URL "Playground", but `playground` is disabled; the
  Apollo local landing page is served at `/graphql` instead.
- `app.controller.ts` exposes a plain REST `GET /` returning "Hello World!" used by
  the e2e smoke test and as a health check; it is outside the GraphQL guard.
