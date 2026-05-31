# @profile-info/admin

React 19 single-page admin dashboard for the profile-info project. It signs in
against the `@profile-info/api` GraphQL endpoint, stores the returned JWT, and
provides CRUD screens for the profile data. It deploys to GitHub Pages.

## Tech stack

- **React 19 + Vite 7**: the SPA and its dev/build tooling. Entry at `src/main.tsx`.
- **TanStack Router**: file-based routing in `src/routes/`, with a generated
  `routeTree.gen.ts`. Authentication is enforced by the `_authenticated` layout.
- **TanStack Query**: server-state and caching. Hooks live in `src/hooks/queries/`
  and `src/hooks/mutations/`.
- **GraphQL Codegen**: `codegen.ts` reads the API schema at `../api/src/schema.gql`
  and generates typed documents into `src/graphql/`.
- **TanStack Table**: data tables (the skills table in `src/routes/.../skills/`).
- **TanStack Form + Zod**: forms in `src/forms/` with schema validation.
- **Zustand**: persisted auth and theme stores in `src/stores/`.
- **Tailwind CSS v4 + DaisyUI**: styling via the `@tailwindcss/vite` plugin and
  `src/styles/globals.css`.
- **nuqs**: URL-synced state for table filters and sorting.

## Project structure

```
src/
├── main.tsx                  # Entry: QueryClient, RouterProvider, ToastContainer.
├── routeTree.gen.ts          # Generated route tree (do not edit by hand).
├── routes/                   # File-based routes (TanStack Router).
│   ├── __root.tsx            # Root layout; NuqsAdapter; error/not-found boundaries.
│   ├── _authenticated.tsx    # Protected layout; gates on the auth token + getMe.
│   ├── _authenticated/
│   │   ├── _sidebar.tsx       # Sidebar/drawer shell with navigation.
│   │   └── _sidebar/
│   │       ├── index.tsx      # Home page.
│   │       └── skills/        # Skills management page + its table component.
│   └── -components/           # login, error, not-found pages.
├── hooks/
│   ├── queries/              # useQuery / useInfiniteQuery hooks (auth, skills, base).
│   ├── mutations/            # useMutation hooks (auth, skills).
│   └── custom/               # Generic helpers (debounce, query-all-pages, etc.).
├── graphql/                  # Generated typed documents and helpers (codegen output).
├── forms/                    # TanStack Form + Zod forms (skill, user/login).
├── components/
│   ├── display/              # Generic display components (modal, alert, data-state).
│   └── inputs/               # Generic input components (text, password, select, ...).
├── lib/                      # execute (GraphQL client), cn, parsers, small helpers.
├── stores/                   # Zustand stores: auth (persisted) and theme.
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
