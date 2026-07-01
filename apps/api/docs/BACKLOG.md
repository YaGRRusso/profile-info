# API Backlog

Deferred API and admin work, ordered by criticality, then value, then effort.

## High Priority

Security, data integrity, and access-control gaps that block safe multi-tenant use.

- **User lifecycle (`user.deleted`)** — Cascade private entities + API tokens; block `SUPER_ADMIN` delete; test for orphans.
- **Organization delete (softer alternative)** — Today hard-deletes every tenant's Experience/Education/Course tied to the org
- **Private CV + REST auth** — `GET /resume.pdf` is public today; REST routes should accept session JWT or `X-Api-Key`

## Medium Priority

Product-facing improvements once core tenancy and auth invariants are in place.

### UI

Admin screens that consume or depend on the API contract above.

- **Admin panel multi-tenant** — Role-aware UI, token management, super-admin tenant view.
- **Users table (admin)** — Super-admin user list/management.

### Better Prompts

Resume and AI output quality without new infrastructure or auth surface.

- **Optimize prompts** — Refine `ats-summarize`, `summarize`, and `translate` for quality, cost, and locale.
- **CV tailoring** — Per-user or per-job variants (sections, emphasis, templates).

### Collaborative Platform

Shared catalog and BYOK when multiple users contribute or bring their own keys.

- **Collaborative catalog** — Users submit skill/org requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **User-owned integration keys** — Optional BYOK for OpenRouter, GitHub, Tavily.

## Low Priority

Scale, hygiene, and product decisions deferrable until the user base grows.

### Test Overhaul

Keep e2e and isolation tests aligned with tenancy rules as entities and auth paths expand.

- **Test suite hygiene** — Keep per-entity isolation e2e aligned with tenancy as entities or auth paths grow.

### Multi Users Expand

Onboarding, cross-origin hosting, token ops, and AI cost controls for many tenants.

- **User registration flow** — Decision needed: public sign-up, invite-only, or paid.
- **CORS per tenant / domain** — Fixed allowlist breaks when portfolios run on other origins.
- **API token hardening** — `lastUsedAt`, per-user limits, rotation, rate limiting, audit log.
- **AI tools plans / rate limits** — Cost control when user base grows; optional paid tier.
