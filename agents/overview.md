# profile-info

> Context for AI agents working in this codebase. Keep it accurate; an agent will trust it.

## Maintaining project documentation

When you learn something relevant and specific (a non-obvious architecture detail, a user preference, a useful command, or a pitfall), **proactively update project docs in the same session**. Be selective: only record what would be valuable in a future session. Do not note generic or obvious things, do not restate what the code already makes plain, and do not duplicate content across files.

**Schema changes:** editing a Mongoose/Prisma/TypeORM model or migration also requires
updating `apps/api/docs/ER_MODEL.md` (diagram, entity list, reference notation, delete
notes) before ending the session.

**Where to update:**

- Repo-wide → `agents/overview.md`
- Human onboarding → `README.md` (when setup/run changes; keep the brief AI context
  section accurate)
- API package → `agents/api.md`
- API onboarding → `apps/api/README.md` (when setup/run changes)
- API persistence model → `apps/api/docs/ER_MODEL.md` (when entities, refs, or delete behavior change)
- Admin package → `agents/admin.md`
- Admin onboarding → `apps/admin/README.md` (when setup/run changes)
- `AGENTS.md` → only when agent files are added or renamed
- Local IDE adapter (Cursor: `.cursor/rules/*.mdc`, gitignored) → when router paths or globs change

Keep edits small and section-local. Update scoped agent files and matching README when setup, run, or extension changes.

## Overview

profile-info manages a personal professional profile. The domain entities are skills, experiences, educations (academic degrees), courses (free courses, bootcamps, certificates), organizations, projects, and users. The repo is an npm workspaces monorepo with two apps under `apps/`:

- `@profile-info/api`: a code-first NestJS + Apollo GraphQL server over MongoDB (Mongoose), with JWT auth. It is the source of truth for data and schema.
- `@profile-info/admin`: a React 19 + Vite SPA that authenticates against the API and provides CRUD screens for the profile data.

## Architecture & flow

The admin is purely a client of the API; there is no shared runtime code between the two packages. They are coupled at the GraphQL schema only.

End to end:

1. The API boots from `apps/api/src/main.ts`, which creates the Nest app, applies a global `ValidationPipe` (`core/configs/validation.config.ts`), and starts the server (`core/configs/app.config.ts`, default `0.0.0.0:8080`, CORS allowing `localhost:*` and `https://yagrrusso.github.io`).
2. `apps/api/src/app.module.ts` wires `ConfigModule` (global), `MongooseModule` (async, reads `DATABASE_URL`), and `GraphQLModule` with the Apollo driver in code-first mode. The schema is auto-generated to `apps/api/src/schema.gql`.
3. The admin runs GraphQL Codegen (`apps/admin/codegen.ts`) against that `../api/src/schema.gql` file to generate typed documents in `apps/admin/src/generated/graphql/`. No running server is needed for codegen.
4. At runtime the admin sends GraphQL over HTTP via `apps/admin/src/lib/execute.ts` to `VITE_API_URL`, attaching the JWT as a Bearer token.

The auth handshake: admin calls the `signIn(signInInput: SignInInput!): String!` mutation with email and password, receives a JWT string, stores it in a persisted Zustand store (`apps/admin/src/stores/auth.ts`, localStorage key `auth`), and sends it on every request. A GraphQL error with extension code `UNAUTHENTICATED` makes the admin clear auth and effectively log the user out.

## Core technologies and where they live

- **npm workspaces**: root `package.json` `workspaces: ["apps/*"]`. Orchestration scripts use `concurrently` to run both apps.
- **NestJS 11 + Apollo GraphQL (code-first)**: `apps/api`, schema generated to `apps/api/src/schema.gql`.
- **MongoDB + Mongoose**: `apps/api`, ODM schemas co-located per module in `apps/api/src/modules/<name>/schemas/`.
- **React 19 + Vite 7**: `apps/admin`.
- **TanStack Router / Query / Table / Form**: `apps/admin`, routing, data fetching, tables, and forms respectively.
- **GraphQL Codegen**: `apps/admin/codegen.ts` generates typed operations from the API schema file.
- **Biome via ultracite**: shared lint and format config in `biome.jsonc`.
- **TypeScript**: `tsconfig.base.json` at the root, extended per package.

## Module / directory breakdown

- `apps/api/`: the GraphQL API. See `agents/api.md` for CRUD modules, auth, DataLoaders, and domain events.
- `apps/admin/`: the React dashboard. See `agents/admin.md` for routing, hooks, the GraphQL client, and the form pattern.
- `agents/`: portable AI context (this file plus scoped `api.md` and `admin.md`). Shared by every IDE and LLM.
- `.cursor/rules/` (optional, local, gitignored): thin Cursor routers that instruct the IDE to read `AGENTS.md` and `agents/*.md`. Other tools may use an equivalent local adapter; it is not part of the shared repo.
- `scripts/`: repo automation (`setup.sh` for Ubuntu bootstrap).
- `docker-compose.yml`: MongoDB 7 service `db` on port 27017, named volume `profile`. The `api` service is present but commented out.
- `.github/workflows/deploy.yml`: builds the admin and deploys it to GitHub Pages.
- `biome.jsonc`, `tsconfig.base.json`: shared tooling config.

## The patterns to follow when extending

- Adding a profile entity to the API: copy an existing feature module (for example `apps/api/src/modules/skills/`) and adapt. Each module has explicit resolver methods and service CRUD. See `agents/api.md`.
- Adding a screen or operation to the admin: write the `.graphql`-tagged operation inside a hook in `apps/admin/src/hooks/queries/` or `hooks/mutations/`, run codegen, then consume the generated typed document. See `agents/admin.md`.
- Keep reusable admin components and hooks domain-agnostic: iterate over the data shape rather than referencing specific entity fields.

## Conventions & standards

- Formatting and linting: Biome configured through `ultracite` presets in `biome.jsonc` (`ultracite/biome/core`, `.../nestjs`, `.../jest`). Run `npm run lint` and `npm run format`. Generated GraphQL artifacts are excluded from Biome.
- Git hooks: husky `pre-commit` runs `npx lint-staged` (Ultracite on staged files).
  Configured in root `package.json` `lint-staged`.
- Types: `tsconfig.base.json` sets `strictNullChecks: true` (not full `strict`). The API package loosens `noImplicitAny` and `strictBindCallApply` to `false`.
- Naming: files and folders are kebab-case; suffixes signal role (`*.resolver.ts`, `*.service.ts`, `*.schema.ts`, `*.entity.ts`, `*.input.ts`).
- Code artifacts (names, comments, files) are written in English even though project discussion may be in Portuguese.
- Testing: API uses Jest — unit tests in `src/**/*.spec.ts`; e2e/integration in `test/**/*.spec.ts` (`npm run test` vs `npm run test:e2e`). The admin has no test setup yet.

## Environment variables

The root has no env file of its own. Each app reads its own. Full per-app catalogs are in the scoped rules. Summary:

- API: `DATABASE_URL`, `JWT_SECRET`, `HOST`, `PORT`. Examples in `apps/api/.env.example`. Loaded from `.env.development` / `.env.production` via Nest's `--env-file` flag.
- Admin: `VITE_API_URL` (the GraphQL endpoint), and `VITE_BASE_PATH` (build-time, used by CI for the GitHub Pages subpath). Example in `apps/admin/.env.example`.

## Scripts / commands

Root scripts (run from the repo root):

- `npm run setup`: runs `bash scripts/setup.sh` to install required tooling.
- `npm run dev`: runs API and admin together in watch mode via `concurrently`.
- `npm run build`: builds both apps.
- `npm run start`: starts both apps in their production-start mode.
- `npm run prod`: runs both apps in their `prod` mode.
- `npm run docker:up` / `npm run docker:down`: start / stop MongoDB via Compose (uses `sudo docker compose`).
- `npm run api:dev` / `npm run admin:dev`: run a single app in watch mode.
- `npm run api:seed`: wipe and repopulate MongoDB with a coherent dev dataset (`alice@profile.info` / `alice.pass`, `bob@profile.info` / `bob.pass`, `admin@profile.info` / `pass.123`). See `apps/api/src/seed.ts`.
- CI (`.github/workflows/deploy.yml`): builds the admin and deploys to GitHub Pages on push to `main`.
- `npm run api:build` / `npm run admin:build`: build a single app.
- `npm run api:start` / `npm run admin:start`: start a single app.
- `npm run test`, `test:watch`, `test:cov`, `test:coverage`, `test:e2e`: delegate to workspaces (API package includes unit and e2e tests; run locally).
- `npm run typecheck`, `npm run lint`, `npm run format`: delegate to workspaces.

## Gotchas & notes

- Edit `agents/*.md` for all context changes. `.cursor/` is gitignored: Cursor users
  maintain thin local routers that point at `agents/`; other devs do the same for
  their IDE if needed. No shared sync script.
- `apps/api/src/schema.gql` is auto-generated by the API at boot/build, but it is committed to git and is the input the admin's codegen reads. After changing API types, regenerate it (build or run the API) so the admin codegen sees the change.
- `docker:up` / `docker:down` shell out to `sudo docker compose`. On a setup where the user is in the `docker` group, the `sudo` may be unnecessary.
- The Compose file defines only MongoDB; the `api` service block is commented out, so the API runs on the host (via `npm run dev`), not in a container.
- CI deploys only the admin (to GitHub Pages), not the API. The API has no deploy pipeline in this repo.
