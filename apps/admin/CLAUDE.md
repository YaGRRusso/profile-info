# CLAUDE.md: @profile-info/admin

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

The admin dashboard for profile-info: a React 19 + Vite SPA that authenticates
against the `@profile-info/api` GraphQL endpoint and edits the profile data. It is
typed end to end against the API schema through GraphQL Codegen, fetches with
TanStack Query, routes with file-based TanStack Router, and persists auth and theme
in Zustand. It builds to a static bundle and deploys to GitHub Pages.

## Architecture & flow

Entry point `src/main.tsx`:

- Builds a `QueryClient` whose `MutationCache.onError` shows a `toast.error`. Query
  defaults: `refetchOnWindowFocus: false`, `retryDelay: 60s`.
- Subscribes to the auth store: when the token transitions from set to null, it
  calls `queryClient.clear()` (logout clears cached data).
- Creates the router from `routeTree.gen.ts` with `basepath: import.meta.env.BASE_URL`
  (Vite's base, driven by `VITE_BASE_PATH` at build time for the Pages subpath).
- Renders `QueryClientProvider` > `ToastContainer` + `RouterProvider`.

Data flow for any operation: a hook calls `execute(document, variables)` from
`src/lib/execute.ts`. `execute` reads the JWT from the auth store, requires
`VITE_API_URL` (throws if missing), POSTs the operation, and on a GraphQL error
with `extensions.code === "UNAUTHENTICATED"` calls `clearAuth()` before throwing.
That clearing triggers the main.tsx subscription, clearing the query cache, and the
route guard then falls back to the login screen. So 401 handling is centralized in
`execute` plus the store subscription, not scattered across hooks.

Routing and auth gate:

- File-based routes under `src/routes/`. `__root.tsx` wraps the tree in
  `NuqsAdapter` and defines error / not-found boundaries.
- `_authenticated.tsx` is the protected layout. It enables `useGetMe()` only when a
  token exists, stores the returned user, and renders the login page when there is
  no authenticated user; otherwise it renders the sidebar shell and the child route.
- Under `_authenticated/_sidebar/` are the actual pages: `index.tsx` (home) and
  `skills/` (the skills CRUD page with its `-components/table.tsx`).

## Core technologies and where they live

- **Vite 7**: `vite.config.ts`. Plugins: `tanstackRouter` (target react,
  autoCodeSplitting), `react`, `tailwindcss`. Alias `@` to `./src`. Dev server on
  port 5173. `base` from `VITE_BASE_PATH` (default `/`).
- **TanStack Router**: routes in `src/routes/`, generated tree in
  `src/routeTree.gen.ts` (produced by the Vite plugin; do not hand-edit).
- **TanStack Query**: `src/main.tsx` client; hooks in `src/hooks/`.
- **GraphQL Codegen**: `codegen.ts`. Schema `../api/src/schema.gql`; documents from
  `src/hooks/queries/*.ts` and `src/hooks/mutations/*.ts`; output `src/graphql/`
  with the `client` preset and `documentMode: "string"`; also writes a
  `schema.graphql` via `schema-ast`.
- **GraphQL client**: `src/lib/execute.ts`, plain `fetch` (no Apollo/urql client).
- **Zustand**: `src/stores/auth.ts` and `src/stores/theme.ts`, both with `persist`.
- **TanStack Form + Zod**: `src/forms/`.
- **TanStack Table**: the skills table component.
- **Tailwind v4 + DaisyUI**: `src/styles/globals.css`.
- **nuqs**: URL state; `NuqsAdapter` in `__root.tsx`, parsers in `src/lib/parsers.ts`.

## Module / directory breakdown

- `src/lib/execute.ts`: the single GraphQL transport. All hooks go through it.
  Companion files: `gql.ts` (`GqlResponse` / `GqlError` types), `tc.ts` (try-catch
  wrapper), `cn.ts` (clsx + tailwind-merge), `parsers.ts` (nuqs parsers),
  `field-error.ts` (extracts a form field error string), `facets.ts`, `unwrap.ts`.
- `src/hooks/queries/`: `auth.ts` (`useGetMe`), `base.ts` (`useApiStatus`),
  `skills.ts` (`useFindManySkills` infinite, plus by-id/single/by-ids). Each defines
  its operation with the `graphql` tag and calls `execute`.
- `src/hooks/mutations/`: `auth.ts` (`useSignIn`), `skills.ts` (`useCreateOneSkill`,
  `useUpdateOneSkill`, `useUpdateManySkills`, `useRemoveOneSkill`,
  `useRemoveManySkills`).
- `src/hooks/custom/`: generic, domain-agnostic helpers (`use-debounce`,
  `use-query-all-pages`, `use-stable-value`, `use-active-badges`).
- `src/graphql/`: codegen output. `graphql.ts` (generated types and the
  `TypedDocumentString` type), `gql.ts` (the typed `graphql()` tag overloads),
  `fragment-masking.ts`, `index.ts`. Treat as generated; regenerate, do not edit.
- `src/forms/`: `skill.tsx`, `skill-multi.tsx` (batch update), `user.tsx` (login).
  `common.d.ts` defines `CommonFormProps` and the form `state` union
  (`CREATING | UPDATING | DELETING | MULTI_*`).
- `src/components/display/` and `src/components/inputs/`: generic, reusable UI
  (modal, alert, data-state, page-title, json; text/password/number/checkbox/
  range/select inputs). These are domain-agnostic and driven by props.
- `src/stores/`: `auth.ts` persists `{ token, user }` to localStorage key `auth`
  with `setToken`, `setUser`, `clearAuth`. `theme.ts` persists `{ theme }` to key
  `theme` (default `"system"`).
- `src/routes/`: see Architecture & flow. Route-private folders are prefixed `-`
  (`-components`), so they are not treated as routes by the router.

## The patterns to follow when extending

Adding a GraphQL operation and hook:

1. In a file under `src/hooks/queries/` or `src/hooks/mutations/`, define the
   operation with the `graphql` tag, for example:
   `const findManySkills = graphql(\`query FindManySkills(...) { ... }\`)`.
2. Regenerate types so `src/graphql/` gets the typed document. There is no
   standalone `codegen` script; codegen runs as part of `npm run dev` (in watch)
   and `npm run build`. To run it once directly: `npx graphql-codegen --config
   codegen.ts`.
3. Wrap it in a hook with `useQuery` / `useInfiniteQuery` / `useMutation`, calling
   `execute(document, variables)` as the query/mutation function. Use a stable
   `queryKey` / `mutationKey`. Infinite queries follow `useFindManySkills`:
   `skillPagination: { skip: pageParam, limit: PAGE_SIZE }` with a `getNextPageParam`.

Adding a form: copy `src/forms/skill.tsx`. Define a Zod schema, call `useForm` with
`validators: { onChange: schema }`, render fields with the `Field` render-prop and
the generic inputs from `src/components/inputs/`, surface errors with
`fieldError(field.state.meta)`, and gate submit with `Subscribe`.

Adding a page: create a route file under `src/routes/_authenticated/_sidebar/` so it
inherits the auth gate and sidebar shell. Keep page-only components in a sibling
`-components/` folder so they are not registered as routes.

Keep components and hooks in `components/`, `hooks/custom/`, and `lib/`
domain-agnostic: drive them by props and iterate over the data shape rather than
hard-coding entity field names. Entity-specific code belongs in the feature's
route folder, form, or query/mutation hook.

## Conventions & standards

- Lint/format: Biome via ultracite (`biome.jsonc` at the repo root). `npm run lint`
  (`biome check .`), `npm run format` (`biome format --write .`). Generated GraphQL
  files are excluded from Biome.
- Types: `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`,
  extending the root base (`strictNullChecks: true`). `module: "esnext"` SPA build.
- Path alias: `@` to `./src` (in `vite.config.ts` and tsconfig).
- Naming: kebab-case files. Components are PascalCase exports; hooks are `useX`.
- Styling: Tailwind v4 with the `@plugin "daisyui"` directive in `globals.css`
  (themes `light --default`, `dracula --prefersdark`). Use DaisyUI component classes
  (`btn`, `input`, `modal`, `drawer`, ...) and the `cn()` helper to merge classes.
- Code artifacts are written in English even when project discussion is Portuguese.
  `index.html` declares `lang="pt-BR"`.
- Testing: no test framework is configured in this package yet.

## Directory map

```
apps/admin/
├── index.html                # Mount point; lang pt-BR; title "Profile Info".
├── vite.config.ts            # tanstackRouter + react + tailwindcss; @ alias; port 5173.
├── codegen.ts                # Codegen from ../api/src/schema.gql -> src/graphql/.
├── tsconfig.json             # References app/node tsconfigs.
├── .env.example              # VITE_API_URL.
└── src/
    ├── main.tsx              # Providers, QueryClient, router, toast, 401 wiring.
    ├── routeTree.gen.ts      # Generated route tree.
    ├── routes/               # File-based routes (see breakdown).
    ├── hooks/                # queries/, mutations/, custom/.
    ├── graphql/              # Codegen output (generated; do not edit).
    ├── forms/                # TanStack Form + Zod forms.
    ├── components/           # display/ and inputs/ generic UI.
    ├── lib/                  # execute (GraphQL client) + small helpers.
    ├── stores/               # auth (persisted) and theme Zustand stores.
    └── styles/globals.css    # Tailwind v4 + DaisyUI + custom utilities.
```

## Environment variables

Vite env vars (`VITE_` prefix is exposed to the client). Loaded by Vite from
`.env.development` / `.env.production`. Example in `.env.example`.

- `VITE_API_URL` (required): the GraphQL endpoint. Read in `src/lib/execute.ts`;
  `execute` throws "missing VITE_API_URL" if unset. Example:
  `http://localhost:8080/graphql`. Baked into the bundle at build time.
- `VITE_BASE_PATH` (optional, build-time): sets Vite `base` in `vite.config.ts`,
  which feeds `import.meta.env.BASE_URL` used as the router `basepath` in
  `main.tsx`. CI sets it to `/<repo>/` for the GitHub Pages project subpath. Default
  `/` for local dev.

`import.meta.env.BASE_URL` is Vite's built-in, derived from `base` (see above), not
a variable you set directly.

## Scripts / commands

Run from `apps/admin/` or via the root `admin:*` aliases.

- `npm run dev`: runs `graphql-codegen --watch` in the background and `vite` (dev
  server). This is what regenerates `src/graphql/` as you edit operations.
- `npm run build`: codegen, then `tsc -b`, then `vite build`.
- `npm run start`: `vite preview` (serves the built bundle).
- `npm run typecheck`: `tsc -b --noEmit`.
- `npm run lint`: `biome check .`. `npm run format`: `biome format --write .`.

## Gotchas & notes

- Codegen reads `../api/src/schema.gql` from disk, so the API does not need to be
  running to generate types, but the schema file must be up to date. After API type
  changes, rebuild/run the API to refresh that file, then re-run codegen here.
- `src/graphql/` and `routeTree.gen.ts` are generated. Edit the source operations
  and route files, then regenerate; manual edits to generated files are lost.
- 401/expired-token handling is implicit: `execute` detects `UNAUTHENTICATED`,
  clears auth, the store subscription clears the query cache, and the
  `_authenticated` layout shows login. Do not add ad-hoc 401 handling in hooks.
- The `dev` script backgrounds codegen with `&`; on a fresh checkout the first Vite
  start may race ahead of the first codegen pass. If types are missing, let codegen
  finish or run `npm run build` once.
- GitHub Pages has no SPA rewrite. The deploy workflow copies `index.html` to
  `404.html` and adds `.nojekyll`; the router `basepath` must match the Pages
  subpath, which is why CI sets `VITE_BASE_PATH`.
- There is no test setup in this package; do not assume a test runner is available.
```
