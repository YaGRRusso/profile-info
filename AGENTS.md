# Agent context

> AI agents: read `agents/` for full project context. This file is a router only.

## What this repo is

Backend and admin panel for managing a personal professional profile. An npm
workspaces monorepo with a NestJS GraphQL API and a React admin dashboard.

## Principles

**Long-term over short-term** — see **Engineering principles** in `agents/overview.md`.
Never ship naming or API shortcuts that will need a second pass; prefer the semantically correct design now.

## Where to find context

- **Repo-wide:** `agents/overview.md` (start here)
- **API package:** `agents/api.md` (when working in `apps/api/`)
- **Admin package:** `agents/admin.md` (when working in `apps/admin/`)

## Human onboarding

`README.md`, `apps/api/README.md`, and `apps/admin/README.md`.

## Maintaining documentation

Update `agents/*.md`. Follow **Maintaining project documentation** in
`agents/overview.md`. Change this router only when agent files are added or renamed.
Cursor users: keep local `.cursor/rules/` routers in sync when paths or globs change
(`.cursor/` is gitignored).
