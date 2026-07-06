# ADR 001 — Local catalog (skills & organizations)

**Status:** Accepted (in progress — API surface done; visibility pending)  
**Date:** 2026-07-01

## Context

Today `Skill` and `Organization` are a shared global catalog. Users need their own
entries (local) without duplicating the global list.

## Decision

- Add `partition`: `GLOBAL` | `LOCAL` (default `GLOBAL`; enum `CatalogPartition`).
- `ownerId` → `User` (creator on every row). `partition` drives visibility and slug uniqueness, not whether `ownerId` is stored.
- Unique key: `{ partition, ownerId, slug }`. Disabled rows keep the slug — re-enable to reuse.
- Invariants (`LOCAL` requires `ownerId`, etc.) live in **services**, not Mongoose hooks.
- Visibility rule: a user sees **all global** + **own local** entries (active for refs/validators). A super admin sees **all global** + **all users' local** entries.

## Done

| Area | What |
|------|------|
| Persistence | `partition`, `ownerId`, unique `{ partition, ownerId, slug }` on Skill and Organization |
| Shared types | `CatalogPartition` enum (Mongoose + GraphQL); `CatalogScope` type for caller visibility (`scope.type.ts`) |
| Docs | `ER_MODEL.md` reflects catalog partition fields |
| API surface | `partition` / `ownerId` on GraphQL entities, mappers, filters; optional `partition` on create; `AuthContext` on catalog services, resolvers, loaders, validators; `toCatalogScope(ctx)` in `auth-context.helper.ts`; `withCatalogScope` / `withCatalogScopeForAggregate` / `withCatalogScopeForMutate` in `catalog-scope.helper.ts` (not wired in services yet). |

## Remaining work

| # | What | Notes |
|---|------|-------|
| 2 | **Queries & auth** | `findMany` / validators / loaders filter by visibility + `disabled`. `USER` mutates only own `LOCAL`; `SUPER_ADMIN` manages `GLOBAL`. |
| 3 | **Consumers** | Resume, dashboard, and private-entity refs accept global or caller's local IDs. |
| 4 | **Admin + tests** | UI for local create/list; seed examples; e2e for slug uniqueness across partitions. |

**Out of scope for now:** moderation workflow, user-submitted global requests (see `BACKLOG.md` → Collaborative catalog).

## Closed ADRs (implemented — files removed)

- **Generic profile** — free-form skill `category`; optional org `website` / `logo`; diverse seed; generalized ATS prompt; skills-by-category dashboard chart removed.
- **User profile skills & skill i18n** — `User.skillIds` (ordered CV list); catalog `relevance` removed; Skill `i18n[]` + slug; resume/ATS from profile skills; admin profile picker with drag-and-drop ordering; cascade on skill delete.
