# ADR 003 — Platform token usage

**Status:** Accepted  
**Date:** 2026-07-12

## Problem

AI mutations use a shared `OPENROUTER_API_KEY`. Without per-user limits, one account
can consume disproportionate platform quota.

## Decision

Use existing `@nestjs/throttler` on `ai-tools` mutations:

- **5 requests / minute / user** (`@Throttle` on `ai-tools.resolver.ts`, hardcoded).
- **Tracker:** `userId` from JWT session in `GqlThrottlerGuard.getTracker()` (not IP).

No Mongo counters, no env knobs, no AI-specific quota service. BYOK deferred — see
`apps/api/docs/BACKLOG.md`.

## Code

- `modules/ai-tools/gql-throttler.guard.ts` — `getTracker` returns `req.user.id`
- `modules/ai-tools/ai-tools.resolver.ts` — `@UseGuards(GqlThrottlerGuard)` + `@Throttle`
