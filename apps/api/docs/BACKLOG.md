# API Backlog

- **User can use your own integration token:** Users can use your own token of Open Router, Github etc.,
- **Test suite overhaul:** E2e/integration specs for unmigrated entities may still use legacy patterns; add per-entity isolation e2e as each private entity completes the ADR 001 checklist (starting with Course).
- **REST auth for controllers:** `resume.pdf` (and future REST routes) should accept API tokens in headers, not public `userId` param.
- **User registration flow:** Today accounts are created manually in MongoDB; need a decision (public sign-up, invite-only, paid).
- **Collaborative catalog:** Users submit skill/org create-update requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **CORS per tenant / domain:** Fixed allowlist breaks when friends host portfolios on different origins.
- **Admin panel multi-tenant:** Role-aware UI, token management screen, super-admin tenant view.
- **AI tools plans / rate limits:** Cost control when user base grows; optional paid tier.
- **API token hardening:** `lastUsedAt`, per-user limits, rotation, audit log, rate limiting.
- **Cross-tenant DataLoader e2e:** Explicit test that nested public catalog resolution cannot leak private entity access.
- **Organization delete (softer alternative):** Today `organization.deleted` hard-deletes every tenant's Experience/Education/Course tied to that org. Revisit detach/nullify if catalog moderation should not wipe tenant data.
- **Private entity owner transfer:** No `ownerId` reassignment on update (delete + recreate). If bulk transfer is ever needed, add an explicit operator mutation — not inferred from generic update inputs.
