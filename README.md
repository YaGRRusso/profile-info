# profile-info

Backend and admin panel for managing a personal professional profile: skills, work experiences, education, organizations, and projects. A GraphQL API stores and serves the data, and a React admin dashboard signs in and edits it.

This is an npm workspaces monorepo (`apps/*`).

## Packages

### API (`@profile-info/api`) [Read Docs](./apps/api/README.md)

NestJS GraphQL server (code-first) backed by MongoDB. Exposes CRUD over profile entities behind JWT authentication.

### Admin (`@profile-info/admin`) [Read Docs](./apps/admin/README.md)

React 19 + Vite single-page admin dashboard that signs in against the API and manages the profile data.

## How the packages relate

The admin is a client of the API. It talks to the API over GraphQL at the URL in `VITE_API_URL`. The API is code-first, so it generates its schema to `apps/api/src/schema.gql`, and the admin runs GraphQL Codegen against that local file to produce typed operations. Because the schema is a file on disk, codegen does not need the API running. Authentication flows one way: the admin calls the `signIn` mutation, stores the returned JWT, and sends it as a Bearer token on every request.

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
