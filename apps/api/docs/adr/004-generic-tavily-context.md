# ADR 004 — Generic Tavily AI context (remove GitHub)

**Status:** Accepted (living document)  
**Date:** 2026-07-15

This ADR is a **starting point**, not a step-by-step spec. When it disagrees with the
codebase, **the code and tests win** — update this file after deliberate changes.

## Problem

AI context enrichment for `summarize` / `atsSummarize` was split across two vendors:

- **GitHub** (`RepositoryMetadataProvider` + `GithubResourceExtractorService`) — README,
  topics, languages for `github.com` project URLs only. Developer-scoped, unused for
  orgs/education/profile, and useless for private repos without privileged tokens.
- **Tavily** (`WebContentProvider` + `WebSearchResourceExtractorService`) — page extract
  for organization `website` / URL keys only.

That was two env keys, two integration folders, and two extractor strategies for what is
really the same job: **turn a public URL or a search query into text the LLM can use**.

The product also needed **web search** (e.g. organization name → grounded snippets), which
Tavily already exposes (`search`) but was not on the port.

## Decision

**One web context capability: Tavily.** Remove the GitHub integration and API key.

### Role of Tavily vs OpenRouter

**Tavily supplies context only.** Extract already returns condensed page text; search
returns snippets. The LLM does **not** re-summarize Tavily output as the product
deliverable. OpenRouter summarizes the **user’s raw text**, using Tavily results (and
other `DetailInput`s) as grounding context.

```
user raw + details (+ optional Tavily enrich) → OpenRouter → rewritten raw summary
```

### Capabilities (shipped path)

| Step | Input | Source | Role |
|------|--------|--------|------|
| **Page context** | URL (`ContextMode.PAGE_EXTRACT`) | Tavily `extract` | Detail text for the prompt |
| **Search context** | Name / query (`ContextMode.WEB_SEARCH`) | Tavily `search` | Detail text for the prompt |
| **Summarize / ATS** | User `raw` + details | OpenRouter | Writes the summary of **raw** |

Existing GraphQL: `summarize` / `atsSummarize` with `DetailInput.contextMode`. Admin sets
`contextMode` on the details that need enrichment (e.g. org name → `WEB_SEARCH`, website
→ `PAGE_EXTRACT`).

Do **not** treat dedicated “summarize this URL / summarize this search” mutations as a
core need: that would re-summarize what Tavily already condensed. Prefer the path above.

Accept the trade-off: **private GitHub repos are out of scope**. Public repo pages and
READMEs that are crawlable via the public web may still enrich via webpage extract
(best-effort). No special-case `github.com` routing.

### Integration ports

Keep ports vendor-neutral under `integrations/tavily/` (same pattern as today):

- **`WebContentProvider`** — `extract(urls, options?)`. Page-context use-case.
- **`WebSearchProvider`** — `search(query, options?)` → neutral results
  (`title`, `url`, `content` / snippet). Search-context use-case.

`TavilyService implements WebContentProvider, WebSearchProvider` (map vendor types
inside the adapter only). Module exports both abstract ports. Do **not** leak
`Tavily*` types into `modules/`.

Rationale for two ports (not one god port): extract and search are different
capabilities; a future vendor might provide only one. One Nest module may still bind
both to the same class.

### Layers (read this first)

| Layer | Owns | Responsibility |
|-------|------|----------------|
| **Ports** (`integrations/`) | `AiChatProvider`, `WebContentProvider`, `WebSearchProvider` | I/O only. No prompts, no GraphQL entities. |
| **Collaborators** (`modules/ai-tools/`) | `ChatService`, `ContextService` | Wrap ports; return module types (`AiEntity`, enriched `DetailInput[]`). |
| **Orchestration** | `AiToolsService` | Use-cases only. Never imports `integrations/`; only injects ChatService + ContextService. |

`ContextService` strategies via GraphQL `DetailInput.contextMode` (`ContextMode`):
`PAGE_EXTRACT` → `enrichPageExtract`; `WEB_SEARCH` → `enrichWebSearch`.

Do **not** add a plugin “extractor registry” per vendor. Collaborators talk to ports;
AiToolsService does not.

### Module shape (`ai-tools`)

- GitHub integration removed (`GITHUB_API_KEY` gone).
- `ContextService.enrichFromDetails(details, type)` — only details with `contextMode`
  set. Modes run in `CONTEXT_FALLBACK_ORDER` (page extract, then web search); the first
  mode that returns details wins. Search query appends `ResourceType`; private
  `maxResultsForQuery` lowers hit count as the query has more words. Add a mode to the
  enum, `runSingleTask`, and the fallback order.
- `ChatService.chat` — `AiChatProvider` → `AiEntity` (mapper owned here).
- Frontend-facing name stays transport-agnostic: `contextMode` on `DetailInput`.

Throttle (ADR 003) continues to apply to all AI mutations.

### Explicit non-goals

- Self-hosted scrapers, Brave/Serper/Exa as alternatives (revisit only if Tavily quota or
  quality fails).
- Authenticated GitHub App / private-repo access.
- Replacing OpenRouter with Tavily “answer” as the sole writer of the user-facing summary.
- First-class GraphQL mutations whose only job is to summarize a URL or search query
  without user `raw` (Tavily already condensed that content).

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
4. **ContextService + ChatService** — shipped (AiToolsService orchestrates module
   collaborators only; `contextMode` + `ResourceType` on search queries).
5. ~~**Summarize webpage / websearch mutations**~~ — **cancelled.** Not needed: Tavily
   output is context for `summarize` / `atsSummarize` of user `raw`, not a product to
   re-summarize. Optional later only if UX needs a dedicated URL/query box that still
   feeds the same raw-summarize path.
6. **Docs sync** — keep this ADR aligned with code (ongoing).
