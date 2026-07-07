# ADR 001 — Local catalog (skills & organizations)

**Status:** Accepted (not implemented)  
**Date:** 2026-07-01

## Decision

**Partition:** `GLOBAL` | `LOCAL`; `ownerId` on every row; unique `{ partition, ownerId, slug }`.
Create assigns partition from role in `toDocumentForCreate` — client never sends `partition`.

| Role | Browse | Mutate |
|------|--------|--------|
| `USER` | all `GLOBAL` + own `LOCAL` | own `LOCAL` |
| `SUPER_ADMIN` | all `GLOBAL` + all `LOCAL` | `GLOBAL` |

Scope: `catalogScope()` in `catalog-scope.helper.ts`.

**Disabled** (skills & orgs — same rules):

| Where | Disabled |
|-------|----------|
| Admin tables (`findManySkills` / `findManyOrganizations`) | show |
| Stored refs on entities (`@ResolveField`, resume) | show — must not break |
| Create/update, pickers (`findManyActive*`) | reject |
| `disable*` / `enable*` | toggle only, no events |

## Catalog access — three modes only

Do not add parallel methods or resolver filters. One path per intent.

| Mode | Scope | Disabled | Used for |
|------|-------|----------|----------|
| **Browse** | caller `ctx` | all in `findMany*`; excluded in `findManyActive*` | admin tables, pickers, GraphQL list queries |
| **Resolve** | **entity `ownerId`** | include | `skillIds` / `organizationId` already saved on course, experience, etc. |
| **Validate** | caller `ctx` | exclude (active only) | create/update via validators |

**Resolve rule:** `@ResolveField` skills/org **never** uses caller ctx. Use
`catalogCrud({ userId: parent.ownerId, crossCatalog: false }).findManyById(ids)`.

Service names (skills & orgs): `browse`, `browseActive`, `resolveRefs(ownerId, ids)`.
Validators = validate mode. GraphQL query names stay; they delegate to browse/browseActive.

**Loaders:** batch `resolveRefs` only; key `{ ownerId, id }`. Experience roles: `ownerId`
on `ExperienceRoleRecord` (resolver-only, not GraphQL field).

**Forbidden:** `findManyByIdForRefs`, string composite loader keys, `compactLoadMany`,
loaders on `findManyActiveById`, filtering nulls in resolvers, unscoped `repository.crud`
on catalog, seed tricks to hide broken resolve.

## In repo today

Schema + `catalogScope()` + `catalogCrud()` on repositories. Services/loaders/resolvers
are legacy — replace per phases below.

## Phases (in order)

| # | Ship | Test |
|---|------|------|
| 1 | `browse` / `browseActive` / `resolveRefs` + validators | unit |
| 2 | Loaders + all `@ResolveField` use resolve | `catalog-disabled-refs.spec.ts` |
| 3 | All catalog reads via browse + `catalogCrud(ctx)` | `catalog-visibility.spec.ts` |
| 4 | All catalog mutations scoped; create input without `partition` | `catalog-mutations.spec.ts`, `catalog-consumer-refs.spec.ts` |
| 5 | Resume, dashboard | consumer tests |
| 6 | Admin partition UI, seed LOCAL, slug rules | `catalog-slug-uniqueness.spec.ts` |

**Done:** phases 1–6 green; disabled refs render on read; writes reject disabled; no unscoped catalog crud.

**Out of scope:** collaborative catalog (`BACKLOG.md`).
