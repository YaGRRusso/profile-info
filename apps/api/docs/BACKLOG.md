# API Backlog

Items deferred from [ADR 001](adr/001-multi-tenant-migration.md) or out of its scope. Admin UI work is tracked here when it depends on API contract decisions.

## Multi-tenant & auth

- **User list reads (`findManyUsers`):** Restrict to `SUPER_ADMIN` only — regular users should use `getMe` / `updateMe`. Defer until admin user-management exists and we verify nothing breaks (owner DataLoaders, tenant views).
- **REST auth for controllers:** `resume.pdf` (and future REST routes) should accept session JWT or API tokens in headers — see **Private CV** below.
- **User registration flow:** Today accounts are created manually in MongoDB; need a decision (public sign-up, invite-only, paid).
- **Collaborative catalog:** Users submit skill/org create-update requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **CORS per tenant / domain:** Fixed allowlist breaks when friends host portfolios on different origins.
- **API token hardening:** `lastUsedAt`, per-user limits, rotation, audit log, rate limiting.
- **Cross-tenant DataLoader e2e:** Explicit test that nested public catalog resolution cannot leak private entity access.
- **Organization delete (softer alternative):** Today `organization.deleted` hard-deletes every tenant's Experience/Education/Course tied to that org. Revisit detach/nullify if catalog moderation should not wipe tenant data.
- **Private entity owner transfer:** No `ownerId` reassignment on update (delete + recreate). If bulk transfer is ever needed, add an explicit operator mutation — not inferred from generic update inputs.

## Admin (out of ADR 001 scope)

- **Admin panel multi-tenant:** Role-aware UI, token management screen, super-admin tenant view.
- **Users table (admin):** User list/management screen visible only to `SUPER_ADMIN`. Likely pairs with `findManyUsers` restriction on the API when implemented.

## Resume / CV

- **Private CV download:** `GET /resume.pdf` is public today (ADR 001 DoD). Future: require session JWT or API token; caller may only download **own** CV (or explicit admin override). Amend ADR DoD when implementing — not a silent change.
- **CV tailoring:** Per-user or per-job resume variants (sections, emphasis, multiple templates). Product feature; unrelated to multi-tenant core.

## AI tools

- **User-owned integration keys:** Users bring their own OpenRouter, GitHub, Tavily keys (optional).
- **AI tools plans / rate limits:** Cost control when user base grows; optional paid tier.
- **Optimize prompts:** Review and refine `ats-summarize`, `summarize`, and `translate` prompts for quality, token cost, and locale handling.

## Test & hygiene

- **Test suite overhaul:** E2e/integration specs for unmigrated entities may still use legacy patterns; add per-entity isolation e2e as each private entity completes the ADR 001 checklist (starting with Course).
