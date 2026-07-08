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

**Permanent rule:** `SUPER_ADMIN` reads all `LOCAL` rows but **never mutates** another
user's `LOCAL` catalog (no future moderation path planned in this ADR).

Implementation: `catalogScope()` → `catalogCrud(ctx)` / `catalogStats(ctx)` on
repositories. Avoid unscoped `repository.crud` on catalog paths.

## Disabled entries and delete

`disable*` / `enable*` toggle `disabled` only — **no** delete events.

`remove*` hard-deletes and emits cascade events (`skill.deleted`, `organization.deleted`).
**Admin UI:** `GLOBAL` catalog → disable/enable (SUPER_ADMIN). `LOCAL` catalog → remove (owner USER). Both use existing `remove*` cascade on hard delete.

| Intent | Include disabled? |
|--------|-------------------|
| Admin lists (`findMany*`) | Yes — show all rows |
| Stored refs already saved (resolve fields, resume, portfolio reads) | Yes — must not break legacy data |
| Pickers (`findMany*` in admin forms) | Yes — visible, `text-error`, not selectable for new attach |
| New-attach validation (`findManyActive*`, `findOneActive*`, `assert*Enabled`) | No — active only |

## Three access intents

Name methods however fits the module; keep the **intent** clear in code and tests.

| Intent | Who scopes the query | Disabled | Typical use |
|--------|----------------------|----------|-------------|
| **Browse** | caller `ctx` | all in `findMany*` / `findOne*`; excluded in `*Active*` | admin tables, catalog CRUD |
| **Resolve** | entity owner (when LOCAL matters) | include | `skillIds` / `organizationId` on saved entities |
| **Validate** | caller `ctx` | exclude | mutations via `*ValidatorService` |

**Resolve (debt):** GraphQL loaders today use **caller** `ctx`, not `parent.ownerId`.
Resume PDF builds owner-scoped `ctx` directly and does not use loaders. Implement
owner-scoped loaders when cross-user GraphQL reads need LOCAL refs (public portfolio, etc.).

**Validate:** `SkillsValidatorService` / `OrganizationsValidatorService` — active refs
only before writes.

## Filter inputs (`partition`, `ownerId`)

`FilterSkillInput` and `FilterOrganizationInput` expose optional `partition` and
`ownerId`. Any authenticated caller may pass them; **read scope** (`toQueryForRead`) still
applies, so `USER` cannot leak another user's `LOCAL` rows (e2e tests 9). `SUPER_ADMIN`
(`crossCatalog`) may combine filters for debugging via GraphQL. Admin UI does not expose
these filters.

## Where to look in code

- Scope: `core/persistence/helpers/catalog-scope.helper.ts`
- Skills / orgs services, loaders, validators: `modules/skills/`, `modules/organizations/`
- Admin: `findMany*` for tables and form pickers (disabled rows shown, not attachable)
- Admin mutate UX: `lib/catalog-mutation-access.ts` — USER blocked on `GLOBAL`, SUPER_ADMIN
  blocked on `LOCAL`

## Verification checklist

1. ~~E2e: USER cria skill LOCAL e vê `partition: LOCAL`~~
2. ~~E2e: USER não desabilita/atualiza/remove skill GLOBAL (Not Found)~~
3. ~~E2e: USER A não lê LOCAL de USER B (`findOneById`, `findManyById`, `findManySkills`)~~
4. ~~E2e: SUPER_ADMIN lê GLOBAL + LOCAL de todos~~
5. ~~E2e: SUPER_ADMIN não muta LOCAL de outro user (Not Found)~~
6. ~~E2e: SUPER_ADMIN cria/muta/desabilita skill GLOBAL~~
7. ~~E2e: `findManyActiveSkills` exclui disabled no escopo do caller~~
8. ~~E2e: `assertSkillsEnabled` bloqueia attach de skill disabled~~
9. ~~E2e: `FilterSkillInput` com `ownerId`/`partition` de outro user não vaza LOCAL~~
10. ~~Unit: `withActiveFilter` força `disabled: false` mesmo com filtro `disabled: true` (já existe — manter)~~
11. ~~Unit: `toQueryForRead` vs `toQueryForAggregate` (string vs ObjectId em `ownerId`)~~
12. ~~E2e: batch (`updateMany`, `disableMany`, `removeMany`) com mix de IDs no escopo e fora~~
13. ~~Integration: `removeOne` em LOCAL próprio e cascade (`skill.deleted` / `organization.deleted`)~~
14. ~~E2e: dashboard `count` catálogo — USER vs SUPER_ADMIN, só active~~
15. ~~E2e: loader/resolve — ids fora do escopo vazios; ids disabled resolvem em browse~~
16. ~~ADR: SUPER_ADMIN lê LOCAL mas não muta LOCAL — regra permanente~~
17. ~~ADR: delete (`remove*`) — API only; admin UI disable/enable only~~
18. ~~ADR: `Filter*Input.partition` / `ownerId` — disponível no GraphQL; escopo de leitura limita efeito~~
19. ~~ADR: dashboard `count` = active only (`countActive` no repository)~~
20. ~~E2e skills: `test/e2e/skills-catalog-scope.spec.ts` (itens 1–9)~~
21. ~~E2e organizations: `test/e2e/organizations-catalog-scope.spec.ts` (itens 1–9)~~
22. ~~Port organizations para o padrão skills (`catalogCrud`, sem `@Roles` blanket, browse/active, validator)~~
23. ~~Admin: queries trazem `partition` e `owner`~~
24. ~~Admin: USER não vê ações de mutate em linhas GLOBAL~~
25. ~~Admin: SUPER_ADMIN não vê ações de mutate em linhas LOCAL~~
26. ~~Admin: coluna Owner visível só para SUPER_ADMIN~~
27. ADR: quando implementar resolve owner-scoped nos loaders
28. ~~E2e: API token com role USER — mesmo escopo de catálogo que sessão JWT~~
29. ~~E2e: resume com refs LOCAL no PDF público (ctx do dono)~~
30. ~~E2e: slug duplicado GLOBAL + LOCAL do mesmo user~~
31. Melhoria: batch mutations falham explicitamente se algum ID ficou fora do escopo (hoje: partial `succeeded`/`failed`)

E2e catalog scope (skills + organizations): `test/e2e/skills-catalog-scope.spec.ts`,
`test/e2e/organizations-catalog-scope.spec.ts`.

E2e catalog batch, loaders, dashboard, API token: `test/e2e/catalog-batch-edge.spec.ts`,
`test/e2e/catalog-loaders-dashboard.spec.ts`.

Integration LOCAL delete cascade: `test/integration/catalog-local-delete-cascade.spec.ts`.

Resume LOCAL refs: `test/e2e/resume.spec.ts`.

## Out of scope here

- Collaborative / moderated catalog — see `BACKLOG.md`
- Exact GraphQL names, loader key shapes, e2e file names — follow existing module
  conventions unless a real bug forces a change
