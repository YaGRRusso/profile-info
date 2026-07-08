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
10. Unit: `withActiveFilter` força `disabled: false` mesmo com filtro `disabled: true` (já existe — manter)
11. Unit/integration: `toQueryForRead` vs `toQueryForAggregate` (string vs ObjectId em `ownerId`)
12. Testar batch (`updateMany`, `disableMany`, `removeMany`) com mix de IDs no escopo e fora
13. Testar `removeOne`/`removeMany` em LOCAL próprio e cascade (`skill.deleted`)
14. Testar dashboard `count` e `findRecentActivity` — USER vs SUPER_ADMIN, só active
15. Testar loader: ids fora do escopo retornam `null`; ids disabled resolvem em browse/resolve
16. ADR: documentar intent resolve — loader hoje usa caller `ctx`, não `parent.ownerId`
17. ADR: quando implementar resolve owner-scoped (LOCAL real, perfis públicos, multi-owner batch)
18. ADR: SUPER_ADMIN lê LOCAL mas não muta LOCAL — confirmar como regra permanente ou moderação futura
19. ADR: delete (`remove*`) faz parte do gerenciamento ou só disable?
20. ADR: `count` do dashboard = active only, não total com disabled
21. ADR: `FilterSkillInput.partition` / `ownerId` — quem pode usar e com qual semântica
22. ADR: API token com role USER — mesmo escopo de catálogo que sessão JWT
23. Admin: query traz `partition` e `ownerId`
24. Admin: USER não vê ações de mutate em linhas GLOBAL
25. Admin: SUPER_ADMIN distingue GLOBAL vs LOCAL na tabela/filtros
26. Admin: alinhar se delete entra na UI ou fica só disable
27. Melhoria: rejeitar/ignorar `ownerId` e `partition` no filter para `!crossCatalog`
28. Melhoria: batch mutations falham explicitamente se algum ID ficou fora do escopo
29. Melhoria: renomear ou documentar `count` → `countActive` no service
30. Melhoria: atualizar `agents/api.md` (dashboard catalog scoped, não global count)
31. ~~Melhoria: e2e de isolamento LOCAL em arquivo dedicado (`skills-catalog-scope.spec.ts`)~~
32. Port organizations para o padrão skills (`catalogCrud`, sem `@Roles` blanket, browse/active, validator)
33. Verificar resume/portfolio com refs LOCAL — viewer fora do escopo vê null ou erro
34. Verificar slug duplicado: mesmo slug em GLOBAL e LOCAL do mesmo user é permitido (`{ partition, ownerId, slug }`)
35. Smoke manual: página Skills como USER e como SUPER_ADMIN após mudanças de UI

E2e items 1–9: `test/e2e/skills-catalog-scope.spec.ts`.

## Out of scope here

- Collaborative / moderated catalog — see `BACKLOG.md`
- Exact GraphQL names, loader key shapes, e2e file names — follow existing module
  conventions unless a real bug forces a change
