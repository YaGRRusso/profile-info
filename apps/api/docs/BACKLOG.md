# API Backlog

Deferred API and admin work, ordered by criticality, then value, then effort.

## High Priority

- **Private CV + REST auth** — `GET /resume.pdf` is public today; REST routes should accept session JWT or `X-Api-Key`
- **Collaborative catalog** — Users submit skill/org requests; `SUPER_ADMIN` moderates; local overrides per tenant.

## Medium Priority

### Better Prompts

- **User-owned integration keys** — Optional BYOK for OpenRouter, GitHub, Tavily.
- **Optimize prompts** — Refine `ats-summarize`, `summarize`, and `translate` for quality, cost, and locale.
- **CV tailoring** — Per-user or per-job variants (sections, emphasis, templates).

### UI

- **Admin panel multi-tenant** — Role-aware UI, token management, super-admin tenant view.
- **Users table (admin)** — Super-admin user list/management.

## Low Priority

### Test Overhaul

- **Test suite hygiene** — Keep per-entity isolation e2e aligned with tenancy as entities or auth paths grow.

### Multi Users Expand

- **User registration flow** — Decision needed: public sign-up, invite-only, or paid.
- **CORS per tenant / domain** — Fixed allowlist breaks when portfolios run on other origins.
- **API token hardening** — `lastUsedAt`, per-user limits, rotation, rate limiting, audit log.
- **AI tools plans / rate limits** — Cost control when user base grows; optional paid tier.
