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

### Layers (read this first)

| Layer | Owns | Responsibility |
|-------|------|----------------|
| **Ports** (`integrations/`) | `AiChatProvider`, `WebContentProvider`, `WebSearchProvider` | I/O only. No prompts, no GraphQL entities. |
| **Collaborators** (`modules/ai-tools/`) | `ChatService`, `ContextService` | Wrap ports; return module types (`AiEntity`, enriched `DetailInput[]`). |
| **Orchestration** | `AiToolsService` | Use-cases only. Never imports `integrations/`; only injects ChatService + ContextService. |

`ContextService` strategies via GraphQL `DetailInput.contextMode` (`ContextMode`): `PAGE_EXTRACT` → `enrichPageExtract`; `WEB_SEARCH` → `enrichWebSearch`.

Do **not** add a plugin “extractor registry” per vendor. Collaborators talk to ports; AiToolsService does not.

### Module shape (`ai-tools`)

- GitHub integration removed (`GITHUB_API_KEY` gone).
- `ContextService.enrichFromDetails(details)` — only details with
  `contextMode` set. `ContextMode.PAGE_EXTRACT` → `enrichPageExtract` /
  `WebContentProvider`; `ContextMode.WEB_SEARCH` → `enrichWebSearch` /
  `WebSearchProvider`. Add future strategies as enum members + switch cases.
- `ChatService.chat` — `AiChatProvider` → `AiEntity` (mapper owned here).
- `enrichPageExtract` / `enrichWebSearch` ready for first-class summarize mutations
  (phases 5–6).
- Prefer explicit GraphQL mutations (`summarizeWebpage`, `summarizeWebsearch`) when
  the UX is a dedicated query/URL box. Existing `summarize` / `atsSummarize` use
  `contextMode` on `DetailInput` (frontend-facing name stays transport-agnostic).

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

## Where to look

- Ports + adapter: `integrations/tavily/`, `integrations/open-router/`
- Collaborators: `modules/ai-tools/context/context.service.ts`,
  `modules/ai-tools/chat/chat.service.ts`
- Orchestration: `modules/ai-tools/ai-tools.service.ts`
- Removed: `integrations/github/`, extractor registry, `WebContextService`

## Implementation phases

1. **ADR + docs** — shipped.
2. **Ports** — shipped (`WebSearchProvider` + Tavily search mapping).
3. **Remove GitHub** — shipped.
4. **ContextService + ChatService** — shipped (AiToolsService orchestrates module collaborators only).
5. **Summarize webpage** — first-class service/mutation (URL in → `enrichPageExtract` → chat).
6. **Summarize websearch** — first-class service/mutation (query in → `enrichWebSearch` → chat); admin wiring when needed.
7. **Docs sync** — re-check after phases 5–6.
