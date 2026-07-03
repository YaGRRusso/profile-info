# ADR 001 — Local catalog (skills & organizations)

**Status:** Accepted (in progress — persistence layer done)  
**Date:** 2026-07-01

## Context

Today `Skill` and `Organization` are a shared global catalog. Users need their own
entries (local) without duplicating the global list.

## Decision

- Add `scope`: `GLOBAL` | `LOCAL` (default `GLOBAL`).
- `ownerId` → `User` only when `scope` is `LOCAL`; global rows have no owner.
- Unique key: `{ scope, ownerId, slug }`. Disabled rows keep the slug — re-enable to reuse.
- Invariants (`LOCAL` requires `ownerId`, etc.) live in **services**, not Mongoose hooks.
- Visibility rule: a user sees **all global** + **own local** entries (active for refs/validators). A super admin sees **all global** + **all users' local** entries.

## Done

| Area | What |
|------|------|
| Persistence | `scope`, `ownerId`, unique `{ scope, ownerId, slug }` on Skill and Organization |
| Shared types | `CatalogScope` enum (Mongoose + GraphQL registration) |
| Docs | `ER_MODEL.md` reflects catalog scope fields |

## Remaining work

| # | What | Notes |
|---|------|-------|
| 1 | **API surface** | Expose `scope` / `ownerId` on entities, mappers, inputs, and filters. `create` with `LOCAL` sets `ownerId` from `ctx`. One entity at a time: skills → organizations. |
| 2 | **Queries & auth** | `findMany` / validators / loaders filter by visibility + `disabled`. `USER` mutates only own `LOCAL`; `SUPER_ADMIN` manages `GLOBAL`. |
| 3 | **Consumers** | Resume, dashboard, and private-entity refs accept global or caller's local IDs. |
| 4 | **Admin + tests** | UI for local create/list; seed examples; e2e for slug uniqueness across scopes. |

**Out of scope for now:** moderation workflow, user-submitted global requests (see `BACKLOG.md` → Collaborative catalog).

## Closed ADRs (implemented — files removed)

- **Generic profile** — free-form skill `category`; optional org `website` / `logo`; diverse seed; generalized ATS prompt; skills-by-category dashboard chart removed.
- **User profile skills & skill i18n** — `User.skillIds` (ordered CV list); catalog `relevance` removed; Skill `i18n[]` + slug; resume/ATS from profile skills; admin profile picker with drag-and-drop ordering; cascade on skill delete.
