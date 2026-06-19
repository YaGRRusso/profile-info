# Architecture Decision Records (ADRs)

> Records of significant architectural decisions for `@profile-info/api`.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [001](./001-multi-tenant-migration.md) | Multi-tenant core & portfolio auth | Proposed |
| [002](./002-collaborative-public-catalog.md) | Collaborative public catalog | Proposed |

Each ADR is a **deliverable increment**: one PR, merge to `main`, portfolio
reflects the change when applicable. Implement in small steps on the feature
branch; open the PR only when the ADR's Definition of Done is met.

## Format

Each ADR follows this structure:

1. **Status** — Proposed, Accepted, Deprecated, Superseded
2. **Context** — Problem and constraints
3. **Decision** — What we chose and why
4. **Definition of Done** — Merge gate for the deliverable PR
5. **Consequences** — Trade-offs, risks, follow-ups

When an ADR is accepted and implemented, update its status and keep
`agents/api.md` in sync if the decision affects agent context.
