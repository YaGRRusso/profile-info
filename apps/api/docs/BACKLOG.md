# API Backlog

Deferred API and admin work, ordered by criticality, then value, then effort.

## Current focus

1. **ADR 004 phases 4–5** — Summarize webpage / websearch GraphQL (and admin) entry points.
   See `apps/api/docs/adr/004-generic-tavily-context.md`.
2. **Better prompts** — Refine AI tools quality, cost, and locale (see High Priority below).

## High Priority

### Generic Tavily AI context (ADR 004)

Phases 2–3 shipped: `WebSearchProvider` + Tavily search mapping; GitHub integration removed;
generic `WebpageResourceExtractorService` for HTTP(S) URL details.

Still open:

- **Summarize webpage / websearch** — first-class service (and GraphQL) entry points; admin wiring as needed (ADR 004 phases 4–5).
- **Docs polish** — keep ADR 004 aligned after mutations land (phase 6).

### Better Prompts

- **Optimize prompts** — Refine `ats-summarize`, `summarize`, and `translate` for quality, cost, and locale.
- **CV tailoring** — Per-user or per-job variants (sections, emphasis, templates).

## Medium Priority

### Multi User

- **Collaborative catalog** — Users submit skill/org requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **Private CV + REST auth** — `GET /resume.pdf` is public today; REST routes should accept session JWT or `X-Api-Key`.
- **Platform token BYOK** — Optional user-owned OpenRouter key. Per-user throttle on AI
  mutations shipped (ADR 003). See `apps/api/docs/adr/003-platform-ai-throttle.md`.

### UI

- **Admin panel multi-tenant** — Broader role-aware chrome beyond Users CRUD (API token management UX, super-admin tenant overview). Users list/CRUD for `SUPER_ADMIN` is shipped (`routes/.../users/`).
- **Profile skill suggestions** — On profile edit, surface skills already linked on the user's experiences, educations, courses, and projects as suggestions when picking `skillIds`. Read-only hints only; user still opts in manually (no auto-sync to profile).

### Local catalog follow-ups (ADR 001 — improvements, not defects)

Shipped in ADR 001: scoped catalog reads/writes, disabled semantics, admin partition UX.
These items were deferred; scope and security behave as documented and tested.

- **Owner-scoped catalog loaders** — GraphQL `@ResolveField` loaders use caller `ctx` today. Resume PDF builds owner-scoped `ctx` directly. Implement owner-scoped loaders when cross-user reads need LOCAL refs (public portfolio, etc.). See ADR 001 checklist item 27.
- **Batch fail-fast** — Batch mutations return partial `succeeded`/`failed` when IDs mix in-scope and out-of-scope. Consider rejecting the whole batch when any ID is out of scope. See ADR 001 checklist item 31.
- **Admin bulk enable/disable for USER** — Row actions show GLOBAL lifecycle buttons disabled for `USER`; bulk enable/disable batch buttons are hidden unless `SUPER_ADMIN`. Align bulk UX with row actions if desired.
- **Admin vitest for catalog UX** — Smoke-test `catalog-mutation-access.ts` (no admin test framework yet).
- **Resume e2e: LOCAL organization** — Resume e2e covers LOCAL skills; add explicit LOCAL org assertion when convenient.
- **API token + catalog mutate e2e** — QUERY token catalog read scope is tested; add MUTATE token + catalog disable/remove edge cases if tokens become a primary integration path.
- **User delete + LOCAL catalog orphans** — `user.deleted` purges private entities and API tokens only. LOCAL skills/orgs for a deleted user remain in Mongo. Add purge listeners only if user deletion becomes a product flow.

## Low Priority

### Test Overhaul

- **Test suite hygiene** — Keep per-entity isolation e2e aligned with tenancy as entities or auth paths grow.

### Multi Users Expand

- **User registration policy** — Self-serve `register` + admin enable (`disabled` gate, seed `pending`, Users admin) is shipped. Product decision still open: invite-only, paid, or keep open sign-up with approval.
- **CORS per tenant / domain** — Fixed allowlist breaks when portfolios run on other origins.
- **API token hardening** — `lastUsedAt`, per-user limits, rotation, rate limiting, audit log.
- **AI tools plans / rate limits** — Cost control when user base grows; optional paid tier (beyond ADR 003 platform throttle).

### Deferred polish (from shipped ADRs)

- **Admin i18n (ADR 002)** — Remaining: table column headers, filter facet labels, enum labels in cells; locale `es` in switcher + JSON. Phases 1–4b (foundation, chrome, forms, validation) are shipped. See `apps/admin/docs/adr/002-admin-i18n.md`.
- **Resume label** — "Certifications" section label vs `Course` entity naming.
- **Skill form AI** — Translate/AI on skill descriptions (organization form already has it).
- **Skill category i18n** — `category` is a free string today; translate per locale if needed.
- **More URL extractors** — AI resource detail: GitHub only; add more providers when needed.
