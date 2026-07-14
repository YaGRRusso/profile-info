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

- `_authenticated.tsx`: protected layout; `beforeLoad` awaits `waitForAuthHydration()` (`stores/auth.ts`), then `useGetMe()` when a token exists. Child routes mount only after session is valid — queries do not gate auth themselves. Unauthenticated → `Auth` shell (`-components/auth.tsx`), which toggles `SignIn` (`SignInForm` + `useSignIn`) and `SignUp` (`SignUpForm` + `useSignUp`) and includes shared `ThemeSwitch` / `LocaleSwitch` (`components/display/`, also used in the sidebar). Public GraphQL `register` (admin hook `useSignUp`) creates a disabled `USER` until a `SUPER_ADMIN` sets `disabled: false` via `updateOneUser`. Dev-only quick login (`DevQuickLogin` inside `SignIn`, `import.meta.env.DEV`) signs in as seed personas with password `123123` (includes `Pending`, which fails sign-in by design for approval-queue QA).
- `index.tsx`: dashboard via `useDashboard()` (stats + recharts).
- `_authenticated/_sidebar/settings/`: profile form + `DownloadCvControl` in page header.
- `_authenticated/_sidebar/`: CRUD pages per entity with `-components/table.tsx`.
- `_authenticated/_sidebar/users/`: SUPER_ADMIN-only user list and CRUD, including enabling pending registrations. Route gate via `beforeLoad: requireRoles(UserRole.SuperAdmin)` (`lib/require-roles.ts` — hydrates auth store, throws `notFound` if role not allowed; page never mounts). API `findManyUsers` / user mutations remain `@Roles(SUPER_ADMIN)`. The signed-in admin is omitted from the list (self-edit via settings/profile).
- `settings/index.tsx`: inline profile form via `useGetMe()` + `useUpdateMe()` (`updateMe` mutation); syncs auth store after save.

Rich forms map flat Zod schemas to nested GraphQL shapes (`i18n`, `organizationId`, `skillIds`, `period`, experience `roles`). GraphQL output still exposes resolved `organization` and `skills` objects. Profile settings uses `forms/profile.tsx` (`profileToForm` / `profileToInput`) with `skillIds` via `MultiSelectInput` + `DraggableList` for display order. ATS on profile description uses the form's skill list (`i18nLabelsByIds`), not the global catalog. Unsaved header alert: TanStack Form `listeners.onChange` → `system-messages` store (do not use `useStore` + `useEffect([isDirty])` on the form — it re-renders during input and steals focus). `useEffect` cleanup on unmount clears the message when leaving settings. `form.reset()` does not fire `onChange` — clear the message in the Reset button handler; clear on successful submit in `onSubmit` as well.

## Core technologies

- **Vite 7**: `vite.config.ts`, port 5173, `base` from `VITE_BASE_PATH`.
- **TanStack Router**: `src/routes/`, generated `routeTree.gen.ts`.
- **TanStack Query**: hooks in `src/hooks/`.
- **GraphQL Codegen**: `codegen.ts` → `src/generated/graphql/` from `../api/src/schema.gql`.
- **GraphQL client**: `src/lib/execute.ts` (GraphQL POST). **REST client**: `src/lib/api.ts` (`getApiOrigin`, `apiRequest`). Binary saves use `src/lib/download-blob.ts` (`downloadBlob`).
- **Zustand**: `stores/auth.ts`, `stores/theme.ts` (persisted); `stores/system-messages.ts` (ephemeral header alerts via `setMessage` / `clearMessage` / `clearAllMessages` on every navigation — `router.subscribe('onResolved')` in `main.tsx`).
- **TanStack Form + Zod**: `src/forms/`.
- **Tailwind v4 + DaisyUI**: `src/styles/globals.css`.
- **dayjs**: `src/lib/dayjs.ts` — relative time; locale synced from `i18n` (`languageChanged` → `syncDayjsLocale`).
- **i18next**: `src/i18n/index.ts`; namespaces in `src/locales/<locale>/`. Prefixed aliases (`tPage`, `tAction`, `tForm`, `tNav`, `tTable`, …). Explicit literal keys per call site; generic keys (e.g. `charts.count`, `fieldArray.emptyTitle`) live inside the shared component — not passed as props. See ADR 002.
- **Recharts**: shared chart styling in `src/lib/chart-theme.ts` (theme colors, tooltips, axis props).
- **nuqs**: URL state via `NuqsAdapter` in `__root.tsx`.

## Module / directory breakdown

- `src/lib/execute.ts`: GraphQL transport. `src/lib/api.ts`: REST transport (`getApiOrigin`, `apiRequest`). Other helpers: `gql.ts`, `tc.ts`, `cn.ts`, `parsers.ts`, `field-error.ts`, `form-errors.ts`, `form-validation.ts`, `form-input.ts` (`omitIfEmpty` / `nullIfEmpty` in `*ToInput` mappers), `chart-theme.ts`, `dayjs.ts`, `i18n.ts` (entity `pickTranslation` / `i18nLabel`), etc.
- `src/hooks/queries/` and `mutations/`: one file per entity; `graphql` tag must use static string literals (no interpolated fragments). Paginated list hooks use `hooks/custom/paginated-query.ts` helpers inside `useInfiniteQuery` — each helper receives an explicit key (`withPagination`: variables pagination key; `paginatedNextPageParam` / `paginatedSelect`: response field name).
- `src/generated/graphql/`: codegen output — regenerate, do not edit.
- `src/forms/`: entity forms + `*ToInput`/`*ToForm` mappers co-located.
- `src/components/`: generic `display/` and `inputs/` (domain-agnostic).
- `src/routes/`: file-based; `-components/` folders are not routes.

## The patterns to follow when extending

Adding a GraphQL operation:

1. Define operation with `graphql` tag in `hooks/queries/` or `hooks/mutations/`.
2. Regenerate via `npm run dev` (watch) or `npm run build`; once: `npx graphql-codegen --config codegen.ts`.
3. Wrap in `useQuery` / `useInfiniteQuery` / `useMutation` calling `execute`. Follow `useFindManySkills` for infinite pagination.

REST reads (e.g. resume PDF): `hooks/mutations/resume.ts` — `fetchResumePdf(locale, userId)` via `apiRequest`, user-triggered download via `useDownloadResume` (`useMutation`; `userId` from auth store).

Adding a form: copy `src/forms/skill.tsx` (Zod + TanStack Form + generic inputs).

Adding a page: route under `src/routes/_authenticated/_sidebar/`; page components in `-components/`.

Keep `components/`, `hooks/custom/`, and `lib/` domain-agnostic. Table toolbar chrome lives in `components/table/` (`BatchToolbar` / `BatchButton`, `VisibilityButton`, `FiltersButton`, `FiltersSelect`, `FiltersRadio`, `FiltersRange` + `DATE_FILTER_OPTIONS`).

## Environment variables

- `VITE_API_URL` (required): GraphQL endpoint; baked in at build time.
- `VITE_BASE_PATH` (optional): Vite `base` / router `basepath`; CI sets GitHub Pages subpath.

## Scripts / commands

`dev`, `build`, `start`, `typecheck`, `lint`, `format` — from `apps/admin/` or root `admin:*`.

## Gotchas & notes

- **i18n (ADR 002):** `i18next` is the single locale source (`i18n.changeLanguage` / `i18n.language`) — drives UI copy (`help`, `nav`, `pages`, `actions`, `alerts`, `dashboard`, `auth`, `forms`, `tables`, `system`, `validation`), `i18nLabel`, skill pickers, and `dayjs` relative time. Form field copy uses `tForm("fields.<key>.label|placeholder|tooltip")`. Page help and subtitles follow persona-inclusive copy rules in ADR 002. Zod errors use `FormError` keys (`invalidFormat`, `invalidRange`, …) → `field-error`; AI/ATS toasts use `tValidation`. Table search/relevance placeholders use `tables`. System header alerts via `tSystem`. See `apps/admin/docs/adr/002-admin-i18n.md`.
- Catalog list tables hide meta columns by default (`id`, `slug`, `createdAt`, `updatedAt`) via `DEFAULT_META_COLUMN_VISIBILITY` in `lib/table-columns.ts` + `usePersistedState`; users can toggle visibility in the table gear menu.
- Codegen reads `../api/src/schema.gql` from disk; keep it up to date after API changes.
- GraphQL Codegen `client` preset (v6+) defaults `enumType` to `string-literal` (union types) and leaves unmapped scalars as `unknown`. This admin relies on runtime enum values (`ExperienceCategory.FullTime`, `Object.values`, `z.enum`) — keep `codegen.ts` on `enumType: "enum"` and map `DateTime` → `string`.
- Batch mutations (`createMany*`, `updateMany*`, `removeMany*`, `disableMany*`, `enableMany*`) return `BatchEntity { succeeded, failed }` — not `count` or entity arrays.
- Catalog admin tables and form pickers: `useFindManyOrganizations` / `useFindManySkills`. Mutate actions: USER read-only on `GLOBAL` rows; SUPER_ADMIN read-only on `LOCAL` rows (`catalog-mutation-access.ts`, `disabled={readOnly}`). Row lifecycle: `GLOBAL` → enable/disable (always visible); `LOCAL` → remove. Batch: remove always; enable/disable batch only for `SUPER_ADMIN`.
- `src/generated/graphql/` and `routeTree.gen.ts` are generated.
- Do not add ad-hoc 401 handling in hooks.
- `dev` backgrounds codegen; first start may race — run `build` once if types missing.
- GitHub Pages: deploy copies `index.html` to `404.html`; `VITE_BASE_PATH` must match Pages subpath.
- Social share tags in `index.html`: `description`, `og:type` / `og:url` / `og:title` / `og:description` / `og:image` (+ width/height). Absolute URLs for Pages. Image: `public/og.png` (1024×600). Instagram does not unfurl links the same way.
- Auth shell (`routes/-components/auth.tsx`) composes `AuthBrandPanel` with `SignIn` / `SignUp`.
- No test framework configured in this package.
