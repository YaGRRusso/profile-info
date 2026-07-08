# ADR 001 — Local catalog (skills & organizations)

**Status:** Accepted (living document)  
**Date:** 2026-07-01

This ADR is a **starting point**, not a step-by-step spec. When it disagrees with the
codebase, **the code and tests win** — update this file after deliberate changes, do not
force legacy wording onto new work.

Applies to **skills** and **organizations** (same rules).

## Data model

- `partition`: `GLOBAL` | `LOCAL`
- `ownerId` on every row (creator; server-assigned on create)
- Unique `{ partition, ownerId, slug }`
- Partition on create comes from role via `toDocumentForCreate` in
  `catalog-scope.helper.ts` — prefer server assignment over client input

| Role | Read scope | Write scope |
|------|------------|-------------|
| `USER` | all `GLOBAL` + own `LOCAL` | own `LOCAL` only |
| `SUPER_ADMIN` | all `GLOBAL` + all `LOCAL` | `GLOBAL` only |

Implementation: `catalogScope()` → `catalogCrud(ctx)` / `catalogStats(ctx)` on
repositories. Avoid unscoped `repository.crud` on catalog paths.

## Disabled entries

`disable*` / `enable*` toggle `disabled` only — **no** delete events.

| Intent | Include disabled? |
|--------|-------------------|
| Admin lists (`findMany*`) | Yes — show all rows |
| Stored refs already saved (resolve fields, resume, portfolio reads) | Yes — must not break legacy data |
| Pickers and new attachments (`findManyActive*`, `findOneActive*`) | No |
| Create/update validation (`assert*Enabled` on consumers) | No — active only |

## Three access intents

Name methods however fits the module; keep the **intent** clear in code and tests.

| Intent | Who scopes the query | Disabled | Typical use |
|--------|----------------------|----------|-------------|
| **Browse** | caller `ctx` | all in `findMany*` / `findOne*`; excluded in `*Active*` | admin tables, catalog CRUD |
| **Resolve** | entity owner (when LOCAL matters) | include | `skillIds` / `organizationId` on saved entities |
| **Validate** | caller `ctx` | exclude | mutations via `*ValidatorService` |

**Resolve:** loading refs on someone else's entity should use the **parent owner's**
catalog scope, not the caller's — especially once `LOCAL` rows exist. Today most data is
`GLOBAL`; implement stricter resolve (e.g. owner-scoped loaders) when LOCAL is in use.

**Validate:** `SkillsValidatorService` / `OrganizationsValidatorService` — active refs
only before writes.

## Where to look in code

- Scope: `core/persistence/helpers/catalog-scope.helper.ts`
- Skills / orgs services, loaders, validators: `modules/skills/`, `modules/organizations/`
- Admin: `findMany*` for tables, `findManyActive*` for form pickers

## Out of scope here

- Collaborative / moderated catalog — see `BACKLOG.md`
- Exact GraphQL names, loader key shapes, e2e file names — follow existing module
  conventions unless a real bug forces a change
