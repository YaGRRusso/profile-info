# profile-info

Backend and admin panel for managing a personal professional profile: skills, work experiences, education, organizations, and projects. A GraphQL API stores and serves the data, and a React admin dashboard signs in and edits it.

This is an npm workspaces monorepo (`apps/*`).

## Why Profile Info

- **Portfolio-ready backend:** Use the GraphQL API as the data source for your
  own portfolio, website, app, or automation. Update your profile once and let
  every connected experience use the same information.
- **Complete professional profile:** Manage contact details, summaries, skills,
  work experiences, roles, education, courses, certificates, organizations, and
  projects in one structured place.
- **AI-assisted writing:** Generate and refine professional summaries and
  descriptions that communicate your experience and impact more clearly.
- **Context-aware AI:** Enrich AI requests with content extracted from relevant
  web pages or web search, giving generated text more useful context.
- **Multilingual content:** Maintain profile information in multiple languages
  and prepare the same professional story for different markets.
- **Resume generation:** Export an up-to-date PDF resume directly from your
  profile, with localized labels and content ordered by relevance.
- **Secure integrations:** Create revocable API credentials with read-only or
  read-and-write permissions for portfolios, scripts, and external tools.
- **Connected career data:** Reuse skills and organizations across experiences,
  education, courses, and projects instead of duplicating information.
- **Profile insights:** Track completeness, statistics, charts, first steps, and
  recent activity from the dashboard.
- **Multi-user administration:** Support independent user data, role-based
  access, registration approval, and secure tenant isolation.
- **Modern admin experience:** Work with responsive forms, powerful tables,
  batch actions, filtering, sorting, light and dark themes, and localized
  English and Portuguese interfaces.

## Packages

### API (`@profile-info/api`) [Read Docs](./apps/api/README.md)

NestJS GraphQL server (code-first) backed by MongoDB. Exposes CRUD over profile entities behind JWT authentication.

### Admin (`@profile-info/admin`) [Read Docs](./apps/admin/README.md)

React 19 + Vite single-page admin dashboard that signs in against the API and manages the profile data.

## How the packages relate

The admin is a client of the API. `VITE_API_URL` is the API origin; GraphQL goes to `{VITE_API_URL}/graphql` and REST paths hang off the same base. The API is code-first, so it generates its schema to `apps/api/src/schema.gql`, and the admin runs GraphQL Codegen against that local file to produce typed operations. Because the schema is a file on disk, codegen does not need the API running. Authentication flows one way: the admin calls the `signIn` mutation, stores the returned JWT, and sends it as a Bearer token on every request.

## AI context

This repo ships machine-readable documentation for AI coding assistants (`AGENTS.md`
and the `agents/` folder). You do not need to maintain it by hand: those files
describe how the project works and instruct assistants to update the context
in-session when they learn something worth keeping. If you use Cursor, thin routers
in `.cursor/rules/` (local, gitignored) point the IDE at these files; other tools
use their own local adapter the same way. Start from `AGENTS.md` if you want an
overview.

## Requirements

- Node >= 22
- npm >= 11
- Docker with the Compose plugin (runs MongoDB locally)

## Getting started

1. Install the required tooling (idempotent, installs only what is missing):

```bash
bash scripts/setup.sh
```

2. Install dependencies:

```bash
npm install
```

3. Start MongoDB:

```bash
npm run docker:up
```

4. Create the env files from the examples:

```bash
cp apps/api/.env.example apps/api/.env.development
cp apps/admin/.env.example apps/admin/.env.development
```

5. Run the API and admin together:

```bash
npm run dev
```
