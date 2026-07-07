# API Backlog

Deferred API and admin work, ordered by criticality, then value, then effort.

## Current focus

1. **ADR 001 — Local catalog** (`apps/api/docs/adr/001-local-catalog.md`): rewrite accepted — implement phases 1→6 in order (access model → resolve → browse → mutations → consumers → admin). Do not ship parallel fix APIs.

## High Priority

### Better Prompts

- **Optimize prompts** — Refine `ats-summarize`, `summarize`, and `translate` for quality, cost, and locale.
- **CV tailoring** — Per-user or per-job variants (sections, emphasis, templates).

## Medium Priority

### Multi User

- **Collaborative catalog** — Users submit skill/org requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **Private CV + REST auth** — `GET /resume.pdf` is public today; REST routes should accept session JWT or `X-Api-Key`.
- **User-owned integration keys** — Optional BYOK for OpenRouter, GitHub, Tavily.

### UI

- **Admin panel multi-tenant** — Role-aware UI, token management, super-admin tenant view.
- **Users table (admin)** — Super-admin user list/management.
- **Profile skill suggestions** — On profile edit, surface skills already linked on the user's experiences, educations, courses, and projects as suggestions when picking `skillIds`. Read-only hints only; user still opts in manually (no auto-sync to profile).

## Low Priority

### Test Overhaul

- **Test suite hygiene** — Keep per-entity isolation e2e aligned with tenancy as entities or auth paths grow.

### Multi Users Expand

- **User registration flow** — Decision needed: public sign-up, invite-only, or paid.
- **CORS per tenant / domain** — Fixed allowlist breaks when portfolios run on other origins.
- **API token hardening** — `lastUsedAt`, per-user limits, rotation, rate limiting, audit log.
- **AI tools plans / rate limits** — Cost control when user base grows; optional paid tier.

### Deferred polish (from shipped ADRs)

- **Resume label** — "Certifications" section label vs `Course` entity naming.
- **Skill form AI** — Translate/AI on skill descriptions (organization form already has it).
- **Skill category i18n** — `category` is a free string today; translate per locale if needed.
- **More URL extractors** — AI resource detail: GitHub only; add more providers when needed.
