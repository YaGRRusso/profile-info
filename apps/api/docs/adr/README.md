# Architecture Decision Records (ADRs)

> Records of significant architectural decisions for `@profile-info/api`.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [001](./001-multi-tenant-migration.md) | Multi-tenant core & API tokens | Proposed |

Deferred work is tracked in [backlog.md](./backlog.md) — not as separate ADRs
until the backend stabilizes.

## Format

Each ADR follows this structure:

1. **Status** — Proposed, Accepted, Deprecated, Superseded
2. **Context** — Problem and constraints
3. **Decision** — What we chose and why
4. **Definition of Done** — Merge gate
5. **Consequences** — Trade-offs and risks

When an ADR is accepted and implemented, update its status and keep
`agents/api.md` in sync if the decision affects agent context.
