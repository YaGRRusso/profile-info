# ADR 001 — Local catalog (skills & organizations)

**Status:** Accepted (in progress)  
**Date:** 2026-07-01  
**Last updated:** 2026-07-07

## Context

Today `Skill` and `Organization` are a shared global catalog. Users need their own
entries (local) without duplicating the global list.

Catalog entries can be **disabled** (`disabled: true`) instead of deleted. Disabled
rows keep their slug and may still be referenced by existing private entities
(experiences, courses, educations, projects, user profile). That is intentional:
disabling must not break published portfolios.

## Decision — partition & ownership

- Add `partition`: `GLOBAL` | `LOCAL` (default `GLOBAL`; enum `CatalogPartition`).
- `ownerId` → `User` (creator on every row). `partition` drives visibility and slug
  uniqueness, not whether `ownerId` is stored.
- Unique key: `{ partition, ownerId, slug }`. Disabled rows keep the slug — re-enable
  to reuse.
- Invariants (`LOCAL` requires `ownerId`, etc.) live in **services**, not Mongoose hooks.
- **Partition visibility (who sees which rows):**
  - `USER` sees **all `GLOBAL`** + **own `LOCAL`** entries.
  - `SUPER_ADMIN` sees **all `GLOBAL`** + **all users' `LOCAL`** entries.
- **Partition on create:** server-assigned in `toDocumentForCreate` from role
  (`crossCatalog` → `GLOBAL`, else `LOCAL`) and `ownerId` from scope. GraphQL create
  inputs must **not** accept `partition` (security lives in the API, not the client).
- **Partition on mutate:** `USER` mutates only own `LOCAL`; `SUPER_ADMIN` manages
  `GLOBAL` (and cross-tenant local reads for admin).

## Decision — disabled catalog entries (skills & organizations)

> **This invariant is non-negotiable.** It applies identically to `Skill` and
> `Organization`. Every implementation step must preserve it. When in doubt, read this
> section before choosing a service method or loader.

### Product rule (plain language)

| Surface | Disabled entries |
|--------|------------------|
| Admin catalog **tables** (`findManySkills`, `findManyOrganizations`) | **Show all**, including disabled |
| **Read** paths: `@ResolveField`, resume, dashboard display, `findOneById`, `findManyById`, DataLoaders | **Must not break.** Still resolve and return disabled rows (`disabled: true` on the entity) |
| **Write** paths: create/update private entities, profile `skillIds`, catalog pickers (`findManyActive*`) | **Must reject** disabled refs — user cannot attach a disabled skill/org on create or update |
| `disable*` / `enable*` mutations | Toggle `disabled` only; no delete cascade |

**Why:** Users may have years-old experiences linking to skills that were later
disabled. Reads must keep working and keep showing those skills. Only **new** refs
are blocked.

### Service method contract

Use the method that matches the **caller's intent**, not convenience.

| Method | `disabled` filter | Partition scope | Use for |
|--------|-------------------|-----------------|---------|
| `findMany` | **No** | Yes (`catalogCrud`) | Admin tables, catalog list |
| `findManyById` | **No** | Yes | DataLoaders, resolved refs, resume org lookup |
| `findOneById` | **No** | Yes | Direct read by id |
| `findManyActive` | **Yes** (`disabled: false`) | Yes | Admin pickers, autocomplete |
| `findManyActiveById` | **Yes** — returns only active rows; **never throws** because a batch contains disabled | Yes | Validators (`assertSkillsExist`, `assertOrganizationsExist`) |
| `findOne` (by filters) | **Yes** (default `disabled: false` via `withActiveFilter`) | Yes | Single lookup when picker semantics apply |
| `findOneActiveById` | **Yes** — throws if disabled | Yes | Explicit active-only read |

**Anti-patterns (do not ship):**

- DataLoaders calling `findManyActiveById` → hides disabled refs on read; breaks courses/experiences.
- `findManyActiveById` throwing when the batch includes disabled → breaks validators and loaders that share the method.
- Applying `withActiveFilter` to `findMany` / `findManyById` → admin tables and portfolio reads lose disabled rows.
- Filtering disabled refs out of seed data only to hide loader bugs → seed may include disabled refs; reads must still work.

### Call-site map

```
Admin table          → findManySkills / findManyOrganizations
Admin picker         → findManyActiveSkills / findManyActiveOrganizations
@ResolveField loader → findManyById (via SkillsLoaderService / OrganizationsLoaderService)
Create/update entity → SkillsValidatorService / OrganizationsValidatorService
                       → findManyActiveById → assertReferencesResolved
Resume / dashboard   → findManyById (owner or caller ctx)
```

### Admin (client)

- Catalog **tables:** `useFindManySkills` / `useFindManyOrganizations` — all rows.
- Reference **pickers:** `useFindManyActiveSkills` / `useFindManyActiveOrganizations`.
- No role/partition logic in the admin for security; partition is server-assigned on create.

## Current baseline (already in repo)

| Area | State |
|------|--------|
| Persistence | `partition`, `ownerId`, unique `{ partition, ownerId, slug }` on Skill and Organization |
| Shared types | `CatalogPartition` enum; `CatalogScope`; `catalogScope()` in `catalog-scope.helper.ts` |
| API surface | `partition` / `ownerId` on GraphQL entities, mappers, filters; `AuthContext` on catalog services |
| Scoped reads (partial) | `repository.catalogCrud(ctx)` on `findOneById`, `findManyById` |
| Known gap | Loaders still call `findManyActiveById` (wrong for read). `findMany` / mutations not fully on `catalogCrud`. Partition visibility incomplete. |

## Implementation plan

Execute **in order**. Each phase is mergeable and must pass its tests before the next.

### Phase 1 — Disabled invariant (read vs write)

**Goal:** Disabled refs never break reads; writes reject disabled refs.

**API:**

- `findManyActiveById`: filter out `disabled: true`; return subset; **do not throw** on disabled in batch.
- `SkillsLoaderService` / `OrganizationsLoaderService`: switch to `findManyById`.
- Confirm `findMany` / `findManyById` do not apply `withActiveFilter`.
- Validators unchanged (already use `findManyActiveById` + `assertReferencesResolved`).

**Tests (required before phase 2):**

- E2E `test/e2e/catalog-disabled-refs.spec.ts`:
  - Course with skill ref → disable skill → `findManyCourses { skills { disabled } }` succeeds, `disabled: true`.
  - Same for organization on course.
  - `findManySkills` / `findManyOrganizations` include disabled; `findManyActive*` exclude them.
  - Create course with disabled skill/org id → `REFERENCES_NOT_FOUND`.
- Unit: `findManyActiveById` filters without throwing.

**Out of scope:** partition scoping, admin UI, slug uniqueness.

### Phase 2 — Catalog scope on all reads & mutations

**Goal:** Every catalog read/mutation uses `catalogCrud(ctx)` / `catalogStats(ctx)`; partition rules enforced.

- Wire `findMany`, `count`, `findRecentActivity`, all mutations through catalog scope.
- `USER` → own `LOCAL` + all `GLOBAL`; `SUPER_ADMIN` → `GLOBAL` partition for mutations.
- Remove `partition` from create GraphQL inputs if still present; `toDocumentForCreate` only.
- `remove*` emits events only after scoped delete succeeds.

**Tests:**

- E2E `catalog-visibility.spec.ts`, `catalog-mutations.spec.ts`.

### Phase 3 — Consumers

**Goal:** Resume, dashboard, private-entity validators resolve catalog with correct `ctx`.

- Resume: org refs via `findManyById` with profile-owner ctx.
- Dashboard catalog stats scoped.
- Private entities validate refs: global + caller's local **active** catalog only.

**Tests:**

- E2E `catalog-consumer-refs.spec.ts`.

### Phase 4 — Admin + seed + slug uniqueness

**Goal:** Admin reflects partition; seed has LOCAL examples; slug rules tested.

- Admin: `partition` column + filter on skills/orgs tables; slug validation on update scoped by row partition.
- Seed: LOCAL catalog examples for joão/maria; seed **may** attach disabled skill refs to entities.
- E2E `catalog-slug-uniqueness.spec.ts`.

## Out of scope for ADR 001

- Moderation workflow, user-submitted global requests → `BACKLOG.md` (Collaborative catalog).

## Closed ADRs (implemented — files removed)

- **Generic profile** — free-form skill `category`; optional org `website` / `logo`; diverse seed; generalized ATS prompt; skills-by-category dashboard chart removed.
- **User profile skills & skill i18n** — `User.skillIds` (ordered CV list); catalog `relevance` removed; Skill `i18n[]` + slug; resume/ATS from profile skills; admin profile picker with drag-and-drop ordering; cascade on skill delete.
