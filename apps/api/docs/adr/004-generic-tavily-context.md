# ADR 004 — Generic Tavily AI context (remove GitHub)

**Status:** Accepted (living document)  
**Date:** 2026-07-15

This ADR is a **starting point**, not a step-by-step spec. When it disagrees with the
codebase, **the code and tests win** — update this file after deliberate changes.

## Problem

AI context enrichment for `summarize` / `atsSummarize` is split across two vendors:

- **GitHub** (`RepositoryMetadataProvider` + `GithubResourceExtractorService`) — README,
  topics, languages for `github.com` project URLs only. Developer-scoped, unused for
  orgs/education/profile, and useless for private repos without privileged tokens.
- **Tavily** (`WebContentProvider` + `WebSearchResourceExtractorService`) — page extract
  for organization `website` / URL keys only.

That is two env keys, two integration folders, and two extractor strategies for what is
really the same job: **turn a public URL or a search query into text the LLM can use**.

The product now also needs **web search** (e.g. organization name → short grounded
summary), which Tavily already exposes (`search`) but is not on the port or as a
first-class use-case.

## Decision

**One web context capability: Tavily.** Remove the GitHub integration and API key.

### Capabilities (use-cases)

| Capability | Input | Source | Then |
|------------|--------|--------|------|
| **Summarize webpage** | URL | Tavily `extract` | OpenRouter summarize / ATS summarize with extracted text as context |
| **Summarize websearch** | Query string | Tavily `search` (snippets / results) | OpenRouter summarize with search hits as context |

Both share the same AI chat path (`AiChatProvider`). Tavily supplies **context**; the
LLM writes the summary. Do not treat Tavily as a replacement for OpenRouter.

Accept the trade-off: **private GitHub repos are out of scope**. Public repo pages and
READMEs that are crawlable via the public web may still enrich via webpage extract
(best-effort). No special-case `github.com` routing.

### Integration ports

Keep ports vendor-neutral under `integrations/tavily/` (same pattern as today):

- **`WebContentProvider`** — `extract(urls, options?)` (already exists). Webpage use-case.
- **`WebSearchProvider`** (new) — `search(query, options?)` → neutral results
  (`title`, `url`, `content` / snippet). Websearch use-case.

`TavilyService` implements both (map vendor types inside the adapter only). Module
exports both abstract ports. Do **not** leak `Tavily*` types into `modules/`.

Rationale for two ports (not one god port): extract and search are different
capabilities; a future vendor might provide only one. One Nest module may still bind
both to the same class.

### Module shape (`ai-tools`)

- **Remove** `integrations/github/` entirely (`GithubModule`,
  `RepositoryMetadataProvider`, `GithubService`).
- **Remove** `GithubResourceExtractorService` and any `GITHUB_API_KEY` from env
  validation, `.env.example`, tests, README, and `agents/*.md`.
- **Generic URL extractor** — one Tavily-backed extractor that accepts HTTP(S) URLs for
  any resource type that passes URL-bearing detail keys (projects, orgs, etc.), not only
  `ORGANIZATION`. No host allowlist beyond “looks like a URL” / `accepts`.
- **Search path** — dedicated service (or extractor keyed by a search/query detail) that
  calls `WebSearchProvider.search`, not page extract.
- Expose **clear GraphQL (or internal service) entry points** for the two capabilities
  above. Prefer explicit mutations or well-named service methods (`summarizeWebpage`,
  `summarizeWebsearch`) over overloading `details[]` with magic keys alone. Existing
  `summarize` / `atsSummarize` may keep enriching from `details` via the generic URL
  extractor; websearch can start as its own mutation if the admin UX is a query box.

Throttle (ADR 003) continues to apply to all AI mutations.

### Explicit non-goals

- Self-hosted scrapers, Brave/Serper/Exa as alternatives (revisit only if Tavily quota or
  quality fails).
- Authenticated GitHub App / private-repo access.
- Replacing OpenRouter with Tavily “answer” as the sole summary writer (optional later;
  default is search/extract → our LLM).

## Consequences

- Fewer secrets and simpler local/prod setup.
- Org and project AI assist use the same public-web path.
- Public GitHub URLs rely on Tavily extract quality instead of the GitHub REST API.
- Websearch adds Tavily search credit usage on top of extract; keep prompts and result
  count bounded.

## Where to look (target)

- Ports + adapter: `integrations/tavily/` (`WebContentProvider`, `WebSearchProvider`,
  `TavilyService`)
- Orchestration: `modules/ai-tools/resource-detail/` (`WebpageResourceExtractorService`)
- New summarize entry points (phases 4–5): next to existing AI mutations
- Removed: `integrations/github/`, `GITHUB_API_KEY`

## Implementation phases

1. **ADR + docs** — shipped.
2. **Ports** — shipped (`WebSearchProvider` + Tavily search mapping).
3. **Remove GitHub** — shipped (generic `WebpageResourceExtractorService`).
4. **Summarize webpage** — first-class service/mutation (URL in → extract → chat).
5. **Summarize websearch** — first-class service/mutation (query in → search → chat); admin wiring when needed.
6. **Docs sync** — re-check `agents/api.md`, README after phases 4–5.
