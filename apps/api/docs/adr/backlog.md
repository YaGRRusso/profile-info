# Multi-tenant backlog

> Work deferred from [ADR 001](./001-multi-tenant-migration.md). Not planned in
> detail — revisit once the backend structure is stable. Ordered by likely priority.


- **Test suite overhaul:** E2e/integration specs assume single-tenant public reads; need systematic rewrite once API is stable.
- **REST auth for controllers:** `resume.pdf` (and future REST routes) should accept API tokens in headers, not public `userId` param.
- **User registration flow:** Today accounts are created manually in MongoDB; need a decision (public sign-up, invite-only, paid).
- **Collaborative catalog:** Users submit skill/org create-update requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **CORS per tenant / domain:** Fixed allowlist breaks when friends host portfolios on different origins.
- **Admin panel multi-tenant:** Role-aware UI, token management screen, super-admin tenant view.
- **AI tools plans / rate limits:** Cost control when user base grows; optional paid tier.
- **API token hardening:** `lastUsedAt`, per-user limits, rotation, audit log, rate limiting.
- **Cross-tenant DataLoader e2e:** Explicit test that nested public catalog resolution cannot leak private entity access.
