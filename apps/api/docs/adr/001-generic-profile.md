# ADR 001 — Generic profile (taxonomy & optional fields)

**Status:** Accepted  
**Date:** 2026-07-01

## Context

The domain was tuned for developers (skill categories as a programming enum, required
org website/logo). The product should work for any profession.

## Decision

**Skill.category**
- Replace `SkillCategory` enum with a free-form optional `string`.
- Admin: text input (no fixed select, no default value).

**Organization**
- `website` and `logo` become optional.

**Dashboard**
- Remove the skills-by-category chart.

**Seed**
- Include skills from varied domains, not only programming.

**AI (ATS)**
- Generalize the prompt (less tech-recruiter bias).

**Deferred**
- Resume: skill grouping by category.
- Resume: "Certifications" label vs `Course` entity naming.

**No change for now**
- AI URL extractors: GitHub only; add more providers later.

## Next steps

| # | What |
|---|------|
| 1 | API: skill `category` string optional; drop `SkillCategory` enum |
| 2 | API: org `website` / `logo` optional |
| 3 | Admin: skill category text input; org optional fields |
| 4 | Dashboard: remove skills-by-category chart |
| 5 | Seed: diverse skill examples |
| 6 | AI: revise ATS prompt |