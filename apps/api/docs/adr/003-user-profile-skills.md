# ADR 003 — User profile skills (CV ownership)

**Status:** Accepted  
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
| 1 | **User schema** | `skillIds` on `UserModel`; mapper; `UpdateMeInput`; GraphQL field + `@ResolveField` `skills` |
| 2 | **Remove catalog relevance** | `Skill` + `Organization`: schema, inputs, filter/sort, admin forms/tables, seed |
| 3 | **Resume** | Build skills from `user.skillIds`; update `select-skill-groups` / tests |
| 4 | **Admin profile** | Skill picker + order on profile form; remove catalog dump in ATS helper |
| 5 | **Cascade** | Pull deleted skill id from `User.skillIds`; e2e |

**Out of scope:** auto-sync profile skills from project/experience/education/course
links; moderation of catalog entries (ADR 002 / `BACKLOG.md`). Skill suggestions
from linked entities on profile edit — see `BACKLOG.md`.

**Supersedes / closes:** resume loading the full global skill catalog; global
`relevance` as CV ranking. ADR 001 deferred "Resume: skill grouping by category"
may still apply on top of ordered `user.skillIds`.
