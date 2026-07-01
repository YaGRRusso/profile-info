# API Backlog

Deferred work and product decisions. Admin UI items depend on API contract when noted.

## Multi-tenant & auth

- **User lifecycle (`user.deleted`):** Cascade `deleteMany` on private entities + API tokens for deleted `USER`; block `SUPER_ADMIN` delete; integration test for orphans.
- **User list reads (`findManyUsers`):** Restrict to `SUPER_ADMIN` only — regular users use `getMe` / `updateMe`. Defer until admin user-management exists.
- **REST auth for controllers:** `resume.pdf` (and future REST routes) should accept session JWT or `X-Api-Key` — see **Private CV** below.
- **User registration flow:** Today accounts are created manually in MongoDB; need a decision (public sign-up, invite-only, paid).
- **Collaborative catalog:** Users submit skill/org create-update requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **CORS per tenant / domain:** Fixed allowlist breaks when friends host portfolios on different origins.
- **API token hardening:** `lastUsedAt`, per-user limits, rotation, audit log, rate limiting.
- **Cross-tenant DataLoader e2e:** Explicit test that nested public catalog resolution cannot leak private entity access.
- **Organization delete (softer alternative):** Today `organization.deleted` hard-deletes every tenant's Experience/Education/Course tied to that org. Revisit detach/nullify if catalog moderation should not wipe tenant data.
- **Private entity owner transfer:** No `ownerId` reassignment on update (delete + recreate). If bulk transfer is ever needed, add an explicit operator mutation.

## Admin

- **Admin panel multi-tenant:** Role-aware UI, token management screen, super-admin tenant view.
- **Users table (admin):** User list/management screen visible only to `SUPER_ADMIN`. Likely pairs with `findManyUsers` restriction on the API when implemented.

## Resume / CV

- **Private CV download:** `GET /resume.pdf` is public today. Future: require session JWT or `X-Api-Key`; caller may only download **own** CV (or explicit admin override).
- **CV tailoring:** Per-user or per-job resume variants (sections, emphasis, multiple templates).

## AI tools

- **User-owned integration keys:** Users bring their own OpenRouter, GitHub, Tavily keys (optional).
- **AI tools plans / rate limits:** Cost control when user base grows; optional paid tier.
- **Optimize prompts:** Review and refine `ats-summarize`, `summarize`, and `translate` prompts for quality, token cost, and locale handling.

## Test & hygiene

- **Test suite overhaul:** Keep per-entity isolation e2e aligned with tenancy rules as new entities or auth paths are added.
