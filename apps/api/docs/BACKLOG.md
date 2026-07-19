# API Backlog

Deferred API and admin work, ordered by **criticality**, then **effort** (ascending), then **value**.

## Current focus

1. **Better prompts** — Refine AI tools quality, cost, and locale (see High Priority below).

## High Priority

### Low effort

- **Unknown backend errors** — Done: API `formatGraphqlError` returns a safe
  client message (`INTERNAL_SERVER_ERROR_MESSAGE`) with code `INTERNAL_SERVER_ERROR`
  for unexpected/5xx errors (logs original server-side). Admin shows `error.message`
  as-is — never translates backend errors. See `platform/graphql/format-graphql-error.ts`.
- **Known backend error translations** — API returns locale-aware messages for
  expected failures; admin keeps displaying `error.message` as-is (no frontend error i18n).
- **Optimize prompts** — Refine `ats-summarize`, `summarize`, and `translate` for quality, cost, and locale.
- **Opt-in “Include web info” on Optimize** — product toggle so Optimize does not always call Tavily when `contextMode` details are present.
- **Experience / profile `contextMode`** — wire AI web context on experience and profile Optimize where it adds value (none today).
- **Array AI context beyond project URLs** — reuse `arrayContextDetails` / `isAiContextArrayIndex` when other forms gain multi-value extract targets (e.g. image URLs).

### Medium effort

- **Error monitoring** — Integrate an error-monitoring service with structured context, environment and release metadata, alerting, and sensitive-data filtering.
- **Redis (or shared) cache** — swap `AppCacheModule` `stores` when multiple API instances need a shared Tavily result store. In-process TTL + LRU is enough for single-instance / spam Optimize today.
- **OpenRouter response cache** — cache identical chat completions separately from Tavily (discussed; not built).
- **Context preview / pick which details to send** — UI to inspect or checkbox web context before Optimize (discussed; not built).

### Large effort

- **CV tailoring** — Per-user or per-job variants (sections, emphasis, templates).

## Medium Priority

### Low effort

- **Private CV + REST auth** — `GET /resume.pdf` is public today; REST routes should accept session JWT or `X-Api-Key`.
- **Batch fail-fast** — Batch mutations return partial `succeeded`/`failed` when IDs mix in-scope and out-of-scope. Consider rejecting the whole batch when any ID is out of scope. See ADR 001 checklist item 31.
- **Admin bulk enable/disable for USER** — Row actions show GLOBAL lifecycle buttons disabled for `USER`; bulk enable/disable batch buttons are hidden unless `SUPER_ADMIN`. Align bulk UX with row actions if desired.
- **Profile skill suggestions** — On profile edit, surface skills already linked on the user's experiences, educations, courses, and projects as suggestions when picking `skillIds`. Read-only hints only; user still opts in manually (no auto-sync to profile).
- **User delete + LOCAL catalog orphans** — `user.deleted` purges private entities and API tokens only. LOCAL skills/orgs for a deleted user remain in Mongo. Add purge listeners only if user deletion becomes a product flow.

### Medium effort

- **Email delivery integration** — Add a provider-neutral email port, provider adapter, templates, configuration, and delivery-failure handling.
- **Event-driven user emails** — Publish explicit business events and send transactional emails from listeners (for example, registration and account-status changes), with each event's recipient, locale, and delivery policy defined as part of that use case.
- **Owner-scoped catalog loaders** — GraphQL `@ResolveField` loaders use caller `ctx` today. Resume PDF builds owner-scoped `ctx` directly. Implement owner-scoped loaders when cross-user reads need LOCAL refs (public portfolio, etc.). See ADR 001 checklist item 27.
- **Platform token BYOK** — Optional user-owned OpenRouter key. Per-user throttle on AI mutations shipped (ADR 003). See `apps/api/docs/adr/003-platform-ai-throttle.md`.
- **Admin vitest for catalog UX** — Smoke-test `catalog-mutation-access.ts` (no admin test framework yet).
- **API token + catalog mutate e2e** — QUERY token catalog read scope is tested; add MUTATE token + catalog disable/remove edge cases if tokens become a primary integration path.
- **Resume e2e: LOCAL organization** — Resume e2e covers LOCAL skills; add explicit LOCAL org assertion when convenient.

### Large effort

- **Collaborative catalog** — Users submit skill/org requests; `SUPER_ADMIN` moderates; local overrides per tenant.
- **Admin panel multi-tenant** — Broader role-aware chrome beyond Users CRUD (API token management UX). Users list/CRUD for `SUPER_ADMIN` is shipped (`routes/.../users/`), including per-user private entity counts (`ownedCounts`).

## Low Priority

### Low effort

- **Resume label** — "Certifications" section label vs `Course` entity naming.
- **Skill form AI** — Translate/AI on skill descriptions (organization form already has it).
- **Skill category i18n** — `category` is a free string today; translate per locale if needed.
- **Admin i18n (ADR 002)** — Remaining: table column headers, filter facet labels, enum labels in cells; locale `es` in switcher + JSON. Phases 1–4b are shipped. See `apps/admin/docs/adr/002-admin-i18n.md`.
- **User registration policy** — Self-serve `register` + admin enable is shipped. Product decision still open: invite-only, paid, or keep open sign-up with approval.

### Medium effort

- **CORS per tenant / domain** — Fixed allowlist breaks when portfolios run on other origins.
- **Test suite hygiene** — Keep per-entity isolation e2e aligned with tenancy as entities or auth paths grow.

### Large effort

- **API token hardening** — `lastUsedAt`, per-user limits, rotation, rate limiting, audit log.
- **AI tools plans / rate limits** — Cost control when user base grows; optional paid tier (beyond ADR 003 platform throttle).

## Reference — ADR 004 shipped (closed)

Shipped (see `apps/api/docs/adr/004-generic-tavily-context.md`):

- Tavily ports only (GitHub removed); `ContextService` + `ChatService`; extract-then-search
  fallback; query-word `maxResults`; Nest in-memory cache via `AppCacheModule` +
  `OrchestratorService.run({ cacheKey })`.
- Admin: org name search + website extract; course/education URL extract; project URLs via
  `arrayContextDetails` (first URL only for `PageExtract` / AI aura).
- Admin UX: Optimize min raw length, textarea `maxLength`, disable Optimize when text
  unchanged vs last send; AI field tooltips.

Deferred follow-ups from ADR 004 are listed under High Priority by effort.
