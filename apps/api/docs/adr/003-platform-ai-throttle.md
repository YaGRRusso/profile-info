# ADR 003 — Platform AI throttle

**Status:** Accepted  
**Date:** 2026-07-12

Formerly named `003-ai-usage-quota-byok.md`. BYOK was never decided here; only the
shared-key throttle shipped.

## Problem

AI mutations use a shared `OPENROUTER_API_KEY`. Without per-user limits, one account
can consume disproportionate platform quota.

## Decision

Use `@nestjs/throttler` on `ai-tools` mutations:

- **App default:** `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }])` in `app.module.ts`.
- **AI mutations:** `@Throttle({ default: { limit: 5, ttl: 60_000 } })` on
  `ai-tools.resolver.ts` (hardcoded; overrides the module default for those routes).
- **Tracker:** `userId` from JWT session in `GqlThrottlerGuard.getTracker()` (not IP).

No Mongo counters, no env knobs, no AI-specific quota service. BYOK (user-owned
OpenRouter key) remains deferred — see `apps/api/docs/BACKLOG.md`.

## Code

- `modules/ai-tools/gql-throttler.guard.ts` — `getTracker` returns `req.user.id`
- `modules/ai-tools/ai-tools.resolver.ts` — `@UseGuards(GqlThrottlerGuard)` + `@Throttle`
