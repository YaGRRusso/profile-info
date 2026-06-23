# @profile-info/admin

> Context for AI agents working in the admin package. Keep it accurate; an agent will trust it.

## Maintaining this rule

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file
and update `apps/admin/README.md` when setup or run changes.

## Overview

The admin dashboard for profile-info: a React 19 + Vite SPA that authenticates against the `@profile-info/api` GraphQL endpoint and edits the profile data. Typed end to end via GraphQL Codegen, TanStack Query for fetching, TanStack Router for file-based routing, Zustand for persisted auth/theme. Builds to a static bundle deployed to GitHub Pages.

## Architecture & flow

Entry point `src/main.tsx`:

- `QueryClient` with `QueryCache.onError` and `MutationCache.onError` → `toast.error`; queries: `staleTime: Infinity` (refetch only via `refetch()` / `invalidateQueries()`), `refetchOnWindowFocus: false`, `retryDelay: 60s`, no retry on `GqlClientError`.
- Auth store subscription: token set → null clears `queryClient`.
- Router from `routeTree.gen.ts` with `basepath: import.meta.env.BASE_URL`.
- `QueryClientProvider` > `ToastContainer` + `RouterProvider`.

Data flow: GraphQL hooks call `execute()` from `src/lib/execute.ts` (POST to `VITE_API_URL`). REST/binary endpoints use `apiRequest()` from `src/lib/api.ts` (`getApiOrigin()` strips the `/graphql` suffix from `VITE_API_URL`). JWT is attached on both when present; GraphQL `UNAUTHENTICATED` clears auth via `execute` + store subscription.

Routing:

- `_authenticated.tsx`: protected layout; `useGetMe()` when token exists; login page when unauthenticated.
- `index.tsx`: dashboard via `useDashboard()` (stats + recharts).
- `_authenticated/_sidebar/settings/`: profile form + `DownloadCvControl` in page header.
- `_authenticated/_sidebar/`: CRUD pages per entity with `-components/table.tsx`.
- `settings/index.tsx`: inline profile form via `useGetMe()` + `useUpdateMe()` (`updateMe` mutation); syncs auth store after save.

Rich forms map flat Zod schemas to nested GraphQL shapes (`i18n`, `organization`, `skills`, `period`, experience `roles`). Profile settings uses `forms/profile.tsx` (`profileToForm` / `profileToInput`).

## Core technologies

- **Vite 7**: `vite.config.ts`, port 5173, `base` from `VITE_BASE_PATH`.
- **TanStack Router**: `src/routes/`, generated `routeTree.gen.ts`.
- **TanStack Query**: hooks in `src/hooks/`.
- **GraphQL Codegen**: `codegen.ts` → `src/generated/graphql/` from `../api/src/schema.gql`.
- **GraphQL client**: `src/lib/execute.ts` (GraphQL POST). **REST client**: `src/lib/api.ts` (`getApiOrigin`, `apiRequest`). Binary saves use `src/lib/download-blob.ts` (`downloadBlob`).
- **Zustand**: `stores/auth.ts`, `stores/theme.ts` (persisted).
- **TanStack Form + Zod**: `src/forms/`.
- **Tailwind v4 + DaisyUI**: `src/styles/globals.css`.
- **dayjs**: configured in `src/lib/dayjs.ts` (relative time, etc.).
- **Recharts**: shared chart styling in `src/lib/chart-theme.ts` (theme colors, tooltips, axis props).
- **nuqs**: URL state via `NuqsAdapter` in `__root.tsx`.

## Module / directory breakdown

- `src/lib/execute.ts`: GraphQL transport. `src/lib/api.ts`: REST transport (`getApiOrigin`, `apiRequest`). Other helpers: `gql.ts`, `tc.ts`, `cn.ts`, `parsers.ts`, `field-error.ts`, `chart-theme.ts`, `dayjs.ts`, `greeting.ts`, etc.
- `src/hooks/queries/` and `mutations/`: one file per entity; `graphql` tag must use static string literals (no interpolated fragments).
- `src/generated/graphql/`: codegen output — regenerate, do not edit.
- `src/forms/`: entity forms + `*ToInput`/`*ToForm` mappers co-located.
- `src/components/`: generic `display/` and `inputs/` (domain-agnostic).
- `src/routes/`: file-based; `-components/` folders are not routes.

## The patterns to follow when extending

Adding a GraphQL operation:

1. Define operation with `graphql` tag in `hooks/queries/` or `hooks/mutations/`.
2. Regenerate via `npm run dev` (watch) or `npm run build`; once: `npx graphql-codegen --config codegen.ts`.
3. Wrap in `useQuery` / `useInfiniteQuery` / `useMutation` calling `execute`. Follow `useFindManySkills` for infinite pagination.

REST reads (e.g. resume PDF): `hooks/queries/resume.ts` — `fetchResumePdf` via `apiRequest`, user-triggered download via `useDownloadResume` (`useMutation`).

Adding a form: copy `src/forms/skill.tsx` (Zod + TanStack Form + generic inputs).

Adding a page: route under `src/routes/_authenticated/_sidebar/`; page components in `-components/`.

Keep `components/`, `hooks/custom/`, and `lib/` domain-agnostic.

## Environment variables

- `VITE_API_URL` (required): GraphQL endpoint; baked in at build time.
- `VITE_BASE_PATH` (optional): Vite `base` / router `basepath`; CI sets GitHub Pages subpath.

## Scripts / commands

`dev`, `build`, `start`, `typecheck`, `lint`, `format` — from `apps/admin/` or root `admin:*`.

## Gotchas & notes

- Codegen reads `../api/src/schema.gql` from disk; keep it up to date after API changes.
- Batch mutations (`createMany*`, `updateMany*`, `removeMany*`) return `BatchEntity { succeeded, failed }` — not `count` or entity arrays.
- `src/generated/graphql/` and `routeTree.gen.ts` are generated.
- Do not add ad-hoc 401 handling in hooks.
- `dev` backgrounds codegen; first start may race — run `build` once if types missing.
- GitHub Pages: deploy copies `index.html` to `404.html`; `VITE_BASE_PATH` must match Pages subpath.
- No test framework configured in this package.
