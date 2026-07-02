# ADR 003 — User profile skills & skill i18n

**Status:** Accepted (complete)  
**Date:** 2026-07-01

## Context

Resume today loads **all catalog skills** (`findMany` on `Skill`) and ranks them by
global `relevance`. A skill like "First Aid" in the global catalog can appear on a
developer's CV even when it has nothing to do with that user.

Global `relevance` on `Skill` and `Organization` is the wrong model: the same skill
can be central for one person and irrelevant for another. Priority belongs on the
**user**, not on the catalog.

Skills linked on projects, experiences, educations, or courses describe **context**
on those entries. They do **not** imply the user wants that skill on the CV summary.
The system does not infer profile skills from those links.

Skills are used across profiles beyond software engineering (soft skills, trades,
healthcare, etc.). Display labels must be **translated per locale** — e.g.
`title` "Atendimento ao Cliente" in `pt` for slug `customer-service`.

Project, Course, and Education already use **slug + required `i18n[]`** with no
separate root display field. Skill follows that pattern, not Organization
(which keeps `name` for the legal/display name of a company).

## Decision

**Remove `relevance` from catalog entities**
- Drop `relevance` from `Skill` and `Organization` (schema, GraphQL, admin, seed).
- Keep `relevance` on owner-scoped entities (`Experience`, `Education`, `Course`,
  `Project`) for section ordering and resume limits.

**`User.skillIds`**
- Add `skillIds: ObjectId[]` on `User` (ordered array).
- **Array order is display priority** on the CV (first = most important). Replaces
  catalog `relevance` for the skills section.
- Validate IDs like other `skillIds` refs: skill must exist, be active, and be visible
  to the user (global + own local per ADR 002).
- On skill delete: remove the id from `User.skillIds` (same cascade pattern as other
  `skillIds` arrays).

**Skill i18n (display title)**
- **`slug` is the stable catalog key** (unique per scope/owner). No `name` on Skill.
- Required `i18n[]`: each entry has `locale`, `messages.title` (required string).
- Resume and locale-aware consumers:
  `pickTranslation(skill.i18n, locale)?.messages.title ?? skill.slug`.
- `pickTranslation` already falls back across configured locales, then `i18n[0]`;
  slug is the last resort when i18n is empty.

**Profile screen (admin)**
- User manages `skillIds` on **Settings → Profile** (`updateMe`), e.g. multi-select
  from catalog with explicit ordering (drag-and-drop or equivalent).
- Opt-in only: to show "JavaScript" on the CV, the user adds it here. A project that
  references JS does **not** auto-add it to the profile list.

**Resume & ATS**
- Skills section: resolve `user.skillIds` in order; group by `Skill.category` if
  grouping is implemented (see ADR 001 deferred item).
- Stop calling `skillsService.findMany` for resume.
- ATS summarize on profile uses the user's skill list, not the global catalog.

## Next steps

| # | What | Notes |
|---|------|-------|
| 1 | **User schema** | `skillIds` on `UserModel`; mapper; `UpdateMeInput`; GraphQL field + `@ResolveField` `skills` — **done** |
| 2 | **Remove catalog relevance** | `Skill` + `Organization`: schema, inputs, filter/sort, admin forms/tables, seed — **done** |
| 3 | **Resume** | Build skills from `user.skillIds`; update `select-skill-groups` / tests — **done** |
| 4 | **Skill i18n API** | Schema, entity, inputs, mapper, seed, resume, tests — **done** |
| 5 | **Skill i18n admin** | Skill form i18n block; `i18nLabel()` / `i18nLabelsByIds()` for pickers/tables — **done** |
| 6 | **Cascade** | Pull deleted skill id from `User.skillIds`; e2e — **done** |
| 7 | **Admin profile** | Skill picker on profile form; ATS uses form skill list — **done** (UI ordering deferred: drag-and-drop) |

**Out of scope:** auto-sync profile skills from project/experience/education/course
links; moderation of catalog entries (ADR 002 / `BACKLOG.md`); translating
`category` (free string; deferred); skill form Translate/AI (organization has it
on description). Skill suggestions from linked entities on profile edit — see
`BACKLOG.md`.

**Supersedes / closes:** resume loading the full global skill catalog; global
`relevance` as CV ranking; root `name` on Skill; ADR 004 (merged here). ADR 001
deferred "Resume: skill grouping by category" may still apply on top of ordered
`user.skillIds`.

**Relates to:** ADR 001 (generic profile), ADR 002 (local catalog).
