# ADR 004 — Skill i18n (display title)

**Status:** Accepted (API)  
**Date:** 2026-07-01

## Context

Skills are used across profiles beyond software engineering (soft skills, trades,
healthcare, etc.). Display labels must be **translated per locale** — e.g.
`title` "Atendimento ao Cliente" in `pt` for slug `customer-service`.

Project, Course, and Education already use **slug + required `i18n[]`** with no
separate root display field. Skill should follow that pattern, not Organization
(which keeps `name` for the legal/display name of a company).

## Decision

**`slug` is the stable catalog key** (unique per scope/owner). No `name` on Skill.

**Required `i18n[]`**
- Each entry: `locale`, `messages.title` (required string).
- Resume and locale-aware consumers:
  `pickTranslation(skill.i18n, locale)?.messages.title ?? skill.slug`.
- `pickTranslation` already falls back across configured locales, then `i18n[0]`;
  slug is the last resort when i18n is empty.

**Out of scope (this ADR)**
- Translating `category` (free string; deferred).
- Admin skill form i18n UI (front).
- ADR 003 steps 4–5 (profile picker, cascade on delete).

## Next steps

| # | What | Notes |
|---|------|-------|
| 1 | **API** | Schema, entity, inputs, mapper, seed, resume, tests — **done** |
| 2 | **Admin** | Skill form i18n block; `i18nLabel()` / `i18nLabelsByIds()` for pickers/tables |

**Relates to:** ADR 001 (generic profile), ADR 003 (`user.skillIds` + resume skills section).
