# API Backlog

Deferred API and admin work, ordered by **criticality**, then **effort** (ascending), then **value**.

## Priority

- **Event-driven user emails** — Publish explicit business events and send transactional emails from listeners (for example, registration and account-status changes), with each event's recipient, locale, and delivery policy defined as part of that use case. Templates (locale-aware bodies) land with this work; delivery plumbing is `integrations/resend/` (`EmailProvider`).

## Backlog

- **Group experiences by organization (read)** — Persist one role per experience; merge/group by `organizationId` only for CV/UI read views.
- **CV tailoring** — Per-user or per-job variants (sections, emphasis, templates).
- **Redis (or shared) cache** — swap `AppCacheModule` `stores` when multiple API instances need a shared Tavily result store. In-process TTL + LRU is enough for single-instance / spam Optimize today.
- **AI tools plans / rate limits** — Cost control when user base grows; optional paid tier.
- **Private CV + REST auth** — `GET /resume.pdf` is public today; REST routes should accept session JWT or `X-Api-Key`.
- **Platform token BYOK** — Optional user-owned OpenRouter key. Per-user throttle on AI mutations shipped.
- **Admin vitest for catalog UX** — Smoke-test `catalog-mutation-access.ts` (no admin test framework yet).
- **API token + catalog mutate e2e** — QUERY token catalog read scope is tested; add MUTATE token + catalog disable/remove edge cases if tokens become a primary integration path.
- **Resume e2e: LOCAL organization** — Resume e2e covers LOCAL skills; add explicit LOCAL org assertion when convenient.
- **Collaborative catalog** — Users submit skill/org requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **CORS per tenant / domain** — Fixed allowlist breaks when portfolios run on other origins.
- **Test suite hygiene** — Keep per-entity isolation e2e aligned with tenancy as entities or auth paths grow.
