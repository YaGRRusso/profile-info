# @profile-info/admin

React 19 single-page admin dashboard for the profile-info project. It signs in
against the `@profile-info/api` GraphQL endpoint, stores the returned JWT, and
provides CRUD screens for the profile data. It deploys to Cloudflare Workers
(`admin.yagorusso.com`).

## Tech stack

- **React 19 + Vite 7**: the SPA and its dev/build tooling. Entry at `src/main.tsx`.
- **TanStack Router**: file-based routing in `src/routes/`, with a generated
  `routeTree.gen.ts`. Authentication is enforced by the `_authenticated` layout.
- **TanStack Query**: server-state and caching. Hooks live in `src/hooks/queries/`
  and `src/hooks/mutations/`.
- **GraphQL Codegen**: `codegen.ts` reads the API schema at `../api/src/schema.gql`
  and generates typed documents into `src/generated/graphql/`.
- **TanStack Table**: data tables (the skills table in `src/routes/.../skills/`).
- **TanStack Form + Zod**: forms in `src/forms/` with schema validation.
- **Zustand**: persisted auth and theme stores in `src/stores/`.
- **Tailwind CSS v4 + DaisyUI**: styling via the `@tailwindcss/vite` plugin and
  `src/styles/globals.css`.
- **nuqs**: URL-synced state for table filters and sorting.

## Project structure

```
src/
├── main.tsx                  # Entry: QueryClient, RouterProvider, Sonner Toaster.
├── routeTree.gen.ts          # Generated route tree (do not edit by hand).
├── routes/                   # File-based routes (TanStack Router).
│   ├── __root.tsx            # Root layout; NuqsAdapter; error/not-found boundaries.
│   ├── _authenticated.tsx    # Protected layout; gates on the auth token + getMe.
│   ├── _authenticated/
│   │   ├── _sidebar.tsx       # Sidebar/drawer shell with navigation.
│   │   └── _sidebar/
│   │       ├── index.tsx      # Home page (dashboard + Download CV).
│   │       ├── settings/      # Account settings (profile update via updateMe).
│   │       ├── users/         # SUPER_ADMIN user list / enable / CRUD.
│   │       ├── skills/        # Catalog + private entity CRUD pages…
│   │       └── …              # organizations, experiences, educations, courses, projects, api-tokens
│   └── -components/           # Auth shell (SignIn/SignUp + AuthBrandPanel), error, not-found.
├── hooks/
│   ├── queries/              # useQuery / useInfiniteQuery hooks.
│   ├── mutations/            # useMutation hooks.
│   └── custom/               # Generic helpers (debounce, paginated-query, etc.).
├── generated/
│   └── graphql/              # Generated typed documents and helpers (codegen output).
├── forms/                    # TanStack Form + Zod forms (entities, profile, auth).
├── components/
│   ├── display/              # Generic display components (modal, alert, data-state).
│   ├── inputs/               # Generic input components (text, password, select, …).
│   └── table/                # Shared table toolbar chrome.
├── lib/                      # Domain-agnostic helpers (i18n, forms, cn, …).
├── service/                  # Backend transports — each exports `request` (graphql, rest, backend).
├── i18n/                     # i18next init (see ADR 002).
├── locales/                  # en + pt JSON namespaces.
├── stores/                   # Zustand: auth, theme (persisted); system-messages.
└── styles/globals.css        # Tailwind v4 + DaisyUI setup and custom utilities.
```

## Requirements

- Node >= 22
- npm >= 11

## Getting started

1. Install dependencies (from the repo root, installs all workspaces):

```bash
npm install
```

2. Create the env file from the example:

```bash
cp .env.example .env.development
```

3. Make sure the API is reachable at `VITE_API_URL` (run it from the repo root):

```bash
npm run api:dev
```

4. Run the admin in dev mode (codegen in watch plus the Vite dev server):

```bash
npm run admin:dev
```

## Deploy (Cloudflare Workers)

Connect the repo via Workers Builds. Build from the monorepo root:

| Setting | Value |
|---------|--------|
| Build command | `npm ci && npm run admin:build` |
| Deploy command | `npx wrangler deploy` |
| `NODE_VERSION` | `22` |
| `VITE_API_URL` | public API origin (no `/graphql`) |

Config: root `wrangler.jsonc` (`assets.directory` = `./apps/admin/dist`, SPA via `not_found_handling`). Leave `VITE_BASE_PATH` unset. Custom domain: `admin.yagorusso.com`. Do not add `public/_redirects` — it conflicts with Workers assets.

### Download CV

The dashboard home (`/`) includes a **Download CV** select. It uses `useDownloadResume()` from `hooks/mutations/resume.ts` (`GET /resume.pdf?userId=&locale=`).

### Account settings

The **Settings** page (`/settings`) loads the authenticated user via `useGetMe()` and saves changes with `useUpdateMe()` (`updateMe` mutation). After a successful save, it invalidates `getMe` and updates the persisted auth store so the sidebar reflects the new name/avatar.

### Locale / i18n

Sidebar **locale switcher** calls `i18n.changeLanguage`. Locale persists via `i18next-browser-languagedetector` (`localStorage` key `i18nextLng`). Same active locale drives `react-i18next` (namespaces: `help`, `nav`, `pages`, `actions`, `alerts`, `dashboard`, `auth`, `forms`, `tables`, `system`, `validation`), `i18nLabel` in tables/pickers, and `dayjs` relative time. Phases 1–4b shipped; remaining backlog (table column/filter labels, locale `es`): `docs/adr/002-admin-i18n.md`.
