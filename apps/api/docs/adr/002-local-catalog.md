# ADR 002 — Local catalog (skills & organizations)

**Status:** Accepted (schemas done)  
**Date:** 2026-07-01

## Context

Today `Skill` and `Organization` are a shared global catalog. Users need their own
entries (local) without duplicating the global list.

## Decision

- Add `scope`: `GLOBAL` | `LOCAL` (default `GLOBAL`).
- `ownerId` → `User` only when `scope` is `LOCAL`; global rows have no owner.
- Unique key: `{ scope, ownerId, slug }`. Disabled rows keep the slug — re-enable to reuse.
- Invariants (`LOCAL` requires `ownerId`, etc.) live in **services**, not Mongoose hooks.
- Visibility rule: a user sees **all global** + **own local** entries (active for refs/validators). a super admin sees **all global** + **all users local** entries

## Next steps

| # | What | Notes |
|---|------|-------|
| 1 | **API surface** | Entities, mappers, inputs, GraphQL enum. `create` LOCAL sets `ownerId` from `ctx`. One entity at a time: skills → organizations. |
| 2 | **Queries & auth** | `findMany` / validators / loaders filter by visibility + `disabled`. USER mutates only own LOCAL; `SUPER_ADMIN` manages GLOBAL. |
| 3 | **Consumers** | Resume, dashboard, private-entity refs accept global or caller's local IDs. |
| 4 | **Admin + tests** | UI for local create/list; seed examples; e2e for slug uniqueness across scopes. |

**Out of scope for now:** moderation workflow, user-submitted global requests (see `BACKLOG.md`).
