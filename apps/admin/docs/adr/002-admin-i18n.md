# ADR 002 — Admin internationalization (UI + entity display locale)

**Status:** Accepted (living document)  
**Date:** 2026-07-09

This ADR is a **starting point**, not a step-by-step spec. When it disagrees with the
codebase, **the code wins** — update this file after deliberate changes, do not force
legacy wording onto new work.

## Context

The admin panel UI is English-only today (sidebar, forms, toasts, modals, table headers,
page help). Profile **content** is multilingual: entities store translations in `i18n[]`
(`locale` + `messages`) and the API exposes `en`, `pt`, and `es` via `LocaleEnum`.

Two concerns were conflated in early discussion:

| Concern | Examples | Mechanism today |
|---------|----------|-----------------|
| **UI strings** | "Manage Courses", "Sign Out", validation errors | Hardcoded English |
| **Entity display** | Skill title in a table, organization description in a form | `lib/i18n.ts` (`pickTranslation`, `i18nLabel`) — defaults to `"en"` when locale is omitted |

There is **no persisted UI locale** in the auth or theme stores. CV download (`DownloadCvControl`)
already lets the user pick a content locale per export, but that choice does not drive tables
or forms.

Tables show structural fields (`slug`, enums, locale codes) and call `i18nLabel(skill)` without
a locale — skills always render in English fallback order. Entity titles are not table columns
today; identification is mostly by `slug`.

## Decision

Treat internationalization as **two independent layers**, delivered in **two phases**.

### Layer A — Entity display locale (no i18next)

**Goal:** When the admin shows translated profile data (skills in tables, pickers, read
modals, ATS previews), pick the translation for the user's **display locale**, not a
hardcoded default.

- Add a persisted **UI display locale** store (Zustand + `localStorage`, same pattern as
  `stores/theme.ts`).
- Reuse `LocaleEnum` / `LOCALES` from `consts/locales.ts` — same codes as profile content
  and resume export (`en`, `pt`, `es`).
- Expose a sidebar control (next to theme switch) to change display locale.
- Pass `displayLocale` into every `i18nLabel(item, locale)` and `pickTranslation(i18n, locale)`
  call site (tables, forms, modals).
- Keep `lib/i18n.ts` as the single helper for **entity** translation picking. Do not rename
  unless a naming collision with react-i18next becomes painful in practice; if renamed,
  prefer `pickEntityTranslation` / `entityLabel`.

**Fallback order** (unchanged): requested locale → `DEFAULT_FORM_LOCALES` (`pt`, `en`) →
first entry in `i18n[]` → `slug`.

### Layer B — UI strings (react-i18next)

**Goal:** Translate chrome strings (navigation, labels, toasts, help text, enum labels in
cells) based on the same display locale.

- Add `i18next` + `react-i18next`.
- JSON namespaces under `src/locales/<locale>/` (e.g. `common.json`, `tables.json`,
  `forms.json`, `help.json`). Start flat; split files when a namespace grows.
- Initialize in `main.tsx` (or a dedicated `src/lib/i18n-setup.ts` imported from `main.tsx`).
- Sync `dayjs` locale when display locale changes (`src/lib/dayjs.ts`).
- Replace hardcoded strings incrementally; **do not** big-bang the whole admin in one PR.

**Patterns:**

| Area | Approach |
|------|----------|
| React components | `useTranslation()` → `t('key')` |
| TanStack Table `getColumns` | Pass `t` into factory: `getColumns({ t, onEdit, ... })` |
| Zod schemas | Factory `createXSchema(t)` or shared message map; avoid inline English in `.refine()` |
| GraphQL enums in cells | `t('enums.courseStatus.complete')` or small `enumLabel(t, group, value)` helper |
| `consts/page-help.ts` | Move copy into `help.json` per locale; keep `PAGE_HELP` keys as stable ids |

**Default locale:** `en`. **Supported UI locales (v1):** `en`, `pt`. `es` optional in v1 if
help/forms volume is manageable; content locale `es` already exists on the API.

Display locale store is the **single source of truth** for both layers. i18next
`changeLanguage` runs when the user switches locale.

## Phased delivery

| Phase | Scope | Out of scope |
|-------|-------|--------------|
| **2a — Display locale** | Store, switcher, wire `i18nLabel` / `pickTranslation` in tables, forms, read modals | UI string translation |
| **2b — Shell UI** | Sidebar, login, `PageTitle`, shared modals/alerts, table headers/filters | Forms, page help |
| **2c — Forms & feedback** | Form labels, placeholders, toasts, Zod messages, enum display in tables | Page help paragraphs |
| **2d — Page help** | `PAGE_HELP` content per locale | API changes |

Each phase should be mergeable; the app stays usable in English until 2b+.

## API touchpoints (optional follow-up)

Dashboard `recentActivity[].label` is built server-side via `labelFromI18nTitle`, which uses
`i18n[0]` — not the admin display locale. Fixing this is **out of scope for 2a–2d** unless
product requires localized activity labels on the home screen. If needed later: pass
`locale` into the dashboard query or resolve labels client-side from full `i18n` payloads.

## Where to look in code

| Topic | Location |
|-------|----------|
| Entity translation pick | `src/lib/i18n.ts` |
| Content locale enum | `src/consts/locales.ts` |
| Skills in tables (today: no locale arg) | `routes/**/-components/table.tsx` |
| Form pickers / ATS | `src/forms/*.tsx` |
| CV export locale (separate control today) | `routes/_authenticated/_sidebar/-components/download-cv.tsx` |
| Page help copy | `src/consts/page-help.ts` |
| Persisted UI prefs pattern | `src/stores/theme.ts` |

## Verification checklist

1. Display locale persists across refresh (`localStorage`).
2. Changing locale updates skill labels in all entity tables without refetch.
3. Form `MultiSelect` skill labels respect display locale.
4. `pickTranslation` in organization/course/education AI preview uses display locale.
5. i18next: sidebar and table headers render in `pt` when locale is `pt`.
6. i18next: at least one CRUD flow (create → toast → modal title) translated end-to-end.
7. `dayjs` relative time (`Recent activity`) matches display locale.
8. Default remains `en` for new sessions; no regression when locale store is empty.
9. `lib/i18n.ts` helpers stay domain-agnostic (no UI string keys).
10. No duplicate locale state (auth store must not gain a second locale field for UI).

## Out of scope here

- Translating user-authored profile content (that is the `i18n[]` arrays on entities).
- i18n for the public resume PDF template (API concern; export already accepts `locale`).
- RTL layout, ICU plural rules beyond i18next defaults, or locale-aware number formatting
  beyond existing `toLocaleDateString` / dayjs usage.
- Admin vitest for i18n (no test framework in admin yet).
- Renaming GraphQL `i18n` fields or API locale enums.

## Related

- Content locales: `apps/api/src/common/i18n/locales.ts`
- API recent-activity label helper: `apps/api/src/common/helpers/recent-activity.helper.ts`
