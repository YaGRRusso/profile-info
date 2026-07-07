# ADR 002 — Persistence scope (CrudRepository / StatsRepository)

**Status:** Accepted (steps 1–3 done; step 4a fallback active; step 4b pending)  
**Date:** 2026-07-06  
**Scope:** Tenant scoping only — refactor what already works. Catalog wiring stays in **ADR 001**.

## Context

`CrudRepository` and `StatsRepository` implement tenant isolation well via `scoped()`:

- `currentScope?: TenantScope`
- `applyScope` → scope `query` helpers (`toQueryForRead`, …)
- `injectOwner` on create
- `scoped(TenantScope)` / `global()`

The **behavior** is correct; the **shape** is not extensible — the core imports `TenantScope` and tenant helpers directly. Any future scope type (catalog in ADR 001, or other rules) would force more `if/else` in the repository or a forked class.

We must **not**:

- fork a new core repository per concern
- reimplement CRUD in `entity.repository.ts`
- change runtime behavior for tenant-scoped entities (courses, experiences, api-tokens, …)

## Decision

Extract tenant logic into a **`PersistenceScope`** strategy; wire it into `CrudRepository` and `StatsRepository` with **zero behavior change** for existing call sites after step 4.

```typescript
interface PersistenceScope {
  query: {
    forRead<T>(filter: QueryFilter<T>): QueryFilter<T>;
    forMutate<T>(filter: QueryFilter<T>): QueryFilter<T>; // update + delete
    forAggregate?<T>(filter: QueryFilter<T>): QueryFilter<T>;
  };
  document: {
    forCreate<T>(payload: AnyKeys<T>): AnyKeys<T>;
    forUpdate<T>(payload: UpdateQuery<T>): UpdateQuery<T>;
  };
}
```

Two axes: **`query`** scopes which documents an operation touches; **`document`** transforms what gets written. Mirrors `CrudMapperInterface` (`toPersistenceForFilter` vs create/update) without one hook per repository method.

Factories: `noopScope` / `resolvePersistenceScope` in `persistence-scope.helper.ts`; `tenantScope` in `tenant-scope.helper.ts`; `catalogScope` in `catalog-scope.helper.ts`. Each scope helper exports `toQueryForRead`, `toQueryForMutate`, `toQueryForAggregate`, `toDocumentForCreate`, `toDocumentForUpdate`.

| Factory | query.forRead | query.forMutate | query.forAggregate | document.forCreate | document.forUpdate |
|---------|---------------|-----------------|--------------------|--------------------|--------------------|
| `noopScope()` | identity | identity | identity | identity | identity |
| `tenantScope(TenantScope)` | `toQueryForRead` | `toQueryForMutate` | `toQueryForAggregate` | `toDocumentForCreate` | `toDocumentForUpdate` (identity) |
| `catalogScope(CatalogScope)` | `toQueryForRead` | `toQueryForMutate` | `toQueryForAggregate` | `toDocumentForCreate` | `toDocumentForUpdate` |

`CrudRepository.scoped(scope)` returns a scoped clone. `global()` ≡ `scoped(noopScope())`.

### Temporary: `TenantScope` adapter (remove in step 4b)

`scoped()` currently accepts `PersistenceScope | TenantScope`. `resolvePersistenceScope()` wraps bare `TenantScope` with `tenantScope()` inside the repository — **not** the long-term API.

Call sites may still use `scoped(toTenantScope(ctx))` during migration. **Target state:** explicit `scoped(tenantScope(toTenantScope(ctx)))` and delete `resolvePersistenceScope` / `isPersistenceScope`.

**Pipeline:** mapper → `scope.query.*` / `scope.document.*` → mongoose.

**Catalog / other scopes:** `catalogScope(CatalogScope)` factory is ready (ADR 001 step 2 will wire skills/organizations). `forRead` (visibility) ≠ `forMutate` (authorization) — no repository changes required to adopt.

## Non-goals

- `catalogScope` factory or skills/organizations service wiring (see ADR 001)
- `composeScope` (YAGNI until two scopes apply to one collection)
- GraphQL or service API changes beyond the mechanical `tenantScope(...)` wrapper in step 4

## Migration steps

Each step is mergeable. Steps 1–3 are done. Step **4a** keeps a temporary `TenantScope` adapter in `scoped()`; step **4b** makes call sites explicit and removes the adapter.

| Step | Deliverable | ~files |
|------|-------------|--------|
| **1** | `PersistenceScope` type + `noopScope()` + `tenantScope()` + unit tests | 3–4 |
| **2** | `CrudRepository` uses `PersistenceScope`; update `crud.repository.spec.ts` | 2–3 |
| **3** | `StatsRepository` same pattern; update `stats.repository.spec.ts` | 2–3 |
| **4a** | `resolvePersistenceScope` — `scoped(TenantScope \| PersistenceScope)` (temporary) | 2–3 |
| **4b** | `scoped(tenantScope(toTenantScope(ctx)))` at call sites; remove adapter | ~15 |

**Order:** 1 → 2 → 3 → 4.

### Step 1 — PersistenceScope

1. Add `PersistenceScope` (`core/persistence/types/` or `scope.type.ts`).
2. Add `persistence-scope.helper.ts`: `noopScope`. Add `tenantScope` in `tenant-scope.helper.ts`.
3. Tests: noop is identity on all hooks; `tenantScope` delegates `query.*` to tenant helpers, `document.forCreate` injects `ownerId`.

No changes to `CrudRepository` / `StatsRepository` yet.

### Step 2 — CrudRepository

1. `currentScope?: PersistenceScope` (replaces `TenantScope`).
2. Reads → `scope.query.forRead`; updates/deletes → `scope.query.forMutate`; creates → `scope.document.forCreate`; updates → `scope.document.forUpdate`.
3. Remove `injectOwner`; create uses `scope.document.forCreate`.
4. `scoped(scope: PersistenceScope | TenantScope)` via `resolvePersistenceScope` (temporary — see step 4b).

Until step 4b, call sites may pass `toTenantScope(ctx)` directly.

### Step 3 — StatsRepository

Mirror step 2: `PersistenceScope`, `query.forRead` / `query.forAggregate`, `scoped` / `global`.

### Step 4a — Temporary adapter (done)

`resolvePersistenceScope` + `isPersistenceScope` in `persistence-scope.helper.ts`. `scoped()` accepts `TenantScope` and wraps with `tenantScope()`.

### Step 4b — Explicit scope at call sites (pending)

```typescript
// today (via adapter)
repository.crud.scoped(toTenantScope(ctx))

// target
repository.crud.scoped(tenantScope(toTenantScope(ctx)))
```

Then remove `resolvePersistenceScope`, `isPersistenceScope`, and `TenantScope` from `scoped()` signatures. Specs assert `tenantScope(toTenantScope(ctx))` or behavioral equivalent.

**Tenant-scoped modules:** api-tokens, courses, educations, experiences, projects.

## Verification

After each step:

```bash
npm run build
npx jest --runInBand --testPathPatterns='persistence-scope|crud\.repository|stats\.repository|tenant-scope'
# After step 4:
npx jest --runInBand --testPathPatterns='api-tokens|courses|educations|experiences|projects'
```

## Done (checklist)

| Step | Status |
|------|--------|
| 1 — PersistenceScope | done |
| 2 — CrudRepository | done |
| 3 — StatsRepository | done |
| 4a — TenantScope adapter | done |
| 4b — Explicit call sites + remove adapter | pending |

## References

- `core/persistence/repositories/crud/crud.repository.ts`
- `core/persistence/repositories/stats/stats.repository.ts`
- `core/persistence/helpers/tenant-scope.helper.ts`
- ADR 001 — catalog (separate; may add `catalogScope` factory when needed)
