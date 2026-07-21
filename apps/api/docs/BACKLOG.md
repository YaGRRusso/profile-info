# API Backlog

Deferred API and admin work, ordered by **criticality**, then **effort** (ascending), then **value**.

## Priority

_(none)_

## Backlog

- **Private CV + REST auth** — `GET /resume.pdf` is public today; REST routes should accept session JWT or `X-Api-Key`.
- **Platform token BYOK** — Optional user-owned OpenRouter key. Per-user throttle on AI mutations shipped.
- **AI tools plans / rate limits** — Cost control when user base grows; optional paid tier.
- **CV tailoring** — Per-user or per-job variants (sections, emphasis, templates).
- **Redis (or shared) cache** — swap `AppCacheModule` `stores` when multiple API instances need a shared Tavily result store. In-process TTL + LRU is enough for single-instance / spam Optimize today.
- **Collaborative catalog** — Users submit skill/org requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **CORS per tenant / domain** — Fixed allowlist breaks when portfolios run on other origins.
- **Test suite hygiene** — Keep per-entity isolation e2e aligned with tenancy as entities or auth paths grow.
