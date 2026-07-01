# API Backlog

Ordered by **criticality → value → effort**. Admin items assume matching API contract when noted.

## High Priority

**User lifecycle (`user.deleted`)** — Cascade private entities + API tokens; block `SUPER_ADMIN` delete; test for orphans.
**Organization delete (softer alternative)** — Today hard-deletes every tenant's Experience/Education/Course tied to the org
**Private CV + REST auth** — `GET /resume.pdf` is public today; REST routes should accept session JWT or `X-Api-Key`

## Medium Priority

**Admin panel multi-tenant** — Role-aware UI, token management, super-admin tenant view.
**Users table (admin)** — Super-admin user list/management.
**Optimize prompts** — Refine `ats-summarize`, `summarize`, and `translate` for quality, cost, and locale.
**CV tailoring** — Per-user or per-job variants (sections, emphasis, templates).
**User-owned integration keys** — Optional BYOK for OpenRouter, GitHub, Tavily.
**Test suite hygiene** — Keep per-entity isolation e2e aligned with tenancy as entities or auth paths grow.
**Collaborative catalog** — Users submit skill/org requests; `SUPER_ADMIN` moderates; local overrides per tenant.

## Low Priority

**User registration flow** — Decision needed: public sign-up, invite-only, or paid.
**CORS per tenant / domain** — Fixed allowlist breaks when portfolios run on other origins.
**API token hardening** — `lastUsedAt`, per-user limits, rotation, rate limiting, audit log.
**AI tools plans / rate limits** — Cost control when user base grows; optional paid tier.
