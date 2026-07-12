# ADR 002 — Admin internationalization (UI + entity display locale)

**Status:** Accepted (living document)  
**Date:** 2026-07-09

This ADR is a **starting point**, not a step-by-step spec. When it disagrees with the
codebase, **the code wins** — update this file after deliberate changes.

## Context

Profile **content** is multilingual (`i18n[]` on entities; locales `en`, `pt`, `es`).
The admin **chrome** is mostly English. Two concerns must stay separate:

| Concern | Examples | Mechanism |
|---------|----------|-----------|
| **Entity display** | Skill title in a table cell or picker | `lib/i18n.ts` (`pickTranslation`, `i18nLabel`) |
| **UI copy** | Page help, page/modal titles and descriptions | `react-i18next` + JSON under `src/locales/` |

`i18next` (`src/i18n/index.ts`) is the **single source of truth** for the active locale.
`i18next-browser-languagedetector` persists the choice in `localStorage` (`i18nextLng`).
It drives UI strings, `i18nLabel` (via `i18n.language`), and `dayjs` (`languageChanged` →
`syncDayjsLocale`).

## Decision

### Active locale (i18next — not a separate Zustand store)

- `i18next` + `i18next-browser-languagedetector` + `react-i18next`; init in `src/i18n/index.ts`, imported from `main.tsx`.
- Sidebar switcher calls `i18n.changeLanguage`.
- Detection: `localStorage` only (no browser-language auto-pick); `fallbackLng` = `en`.
- Drives entity labels via `i18nLabel` / `pickTranslation` (tables, pickers, modals).
- Does **not** translate table column headers, filters, or enum labels in cells.

### UI strings (react-i18next)

- Namespaces: `help`, `nav`, `pages`, `actions`, `alerts`, `dashboard`, `login`, `forms`, `tables`.

#### `useTranslation` aliases (always prefixed — never bare `t`)

| Context | Hooks (fixed order) | Example call |
|---------|---------------------|--------------|
| CRUD route | `tAction`, `tAlert`, `tPage`, `tHelp` | `tPage("courses.manageTitle")` |
| CRUD route + `i18nLabel` in modals | above, then `i18n` / `locale` | `i18nLabel(skill, locale)` |
| Settings / home route | `tPage`, `tHelp`, `tAlert` (omit unused) | `tPage("settings.title")` |
| Table toolbar | `tAction` only | `tAction("clearAll")` |
| Table search / relevance placeholders | `tTable` | `tTable("search")`, `tTable("relevanceMin", { value })` |
| Table + `i18nLabel` in cells | `tAction`, `tTable`, then `i18n` / `locale` | `i18nLabel(skill, locale)` |
| Actions chrome (modal backdrop, download CV, profile save) | `tAction` | `tAction("close")` |
| Sidebar nav | `tNav` | `tNav("skills")` |
| Dashboard widgets | `tDashboard` | `tDashboard("stats.skills")` |
| Login page | `tLogin` (+ `tForm` in `UserForm`) | `tLogin("title")`, `tForm("fields.email.label")` |
| Entity forms | `tForm`, `tAction` | `tForm("fields.slug.label")`, `tAction("cancel")` |

Omit hooks the file does not use. Never build keys dynamically (`t(\`stats.${key}\`)`, `t(item.id)`).

#### Copy in JSX

Literal keys at the call site: `tPage("settings.summary.phone")`, `label={tDashboard("stats.skills")}`. Each item gets its own explicit key — passing the resolved string as a `label`/`title` prop is fine.

**Do not** pass **generic** translation keys through props into shared components (e.g. `countLabel={tDashboard("charts.count")}` on a reusable chart). If a shared component needs generic copy (`charts.count`, `close`, …), it calls `useTranslation` for that key internally.

Never build keys dynamically (`t(\`stats.${key}\`)`, `t(item.id)`). Dynamic lists keyed by enum: `switch` with one explicit `href` / `icon` / `t("literal.key")` per case (same spirit as unrolled `MetricCard`s in `dashboard-stats`).

#### Post-mutation close (CRUD routes)

- `closeForm` — `setFormValues(undefined)` only; use when mutation hooks invalidate list queries (`skills`, `organizations`).
- `closeAndRefetch` — close + `findMany*.refetch()`; use when mutations do not invalidate yet (`courses`, `experiences`, …). Prefer adding `invalidateQueries` to mutations and converging on `closeForm` when touching that layer.

**In scope (phase 1):**

| Area | Approach |
|------|----------|
| Page help | `help.json`; `pageHelp(tHelp, "courses")` in routes |
| Sidebar nav | `nav.json`; `useTranslation("nav")` in `_sidebar.tsx` |
| Page / modal titles & descriptions | `pages.json`; `useTranslation("pages")` directly in routes |
| Entity i18n labels | `i18nLabel(item)` defaults to `i18n.language`; tables may pass locale explicitly |
| Skill pickers in forms | `i18nLabel(skill, locale)` in options; `i18n.language` in `useMemo` deps |
| Relative timestamps | `formatRelativeTime` via `dayjs` synced on `languageChanged` |

**In scope (phase 2):**

| Area | Approach |
|------|----------|
| Shared actions | `actions.json`; `useTranslation("actions")` — Cancel, Confirm, Close, Copy token, Download CV, Save changes, table toolbar labels |
| Page / modal buttons | `pages.json` `newButton` per entity; modal actions via `useTranslation("actions")` on CRUD routes |
| Success toasts (front) | `alerts.json`; `useTranslation("alerts")` + `toast` on route `onSuccess` |
| Dashboard widgets | `dashboard.json`; stats, charts, profile completeness, recent activity |
| Login chrome | `login.json` — page title/subtitle; `UserForm` in `forms.json` |
| Table toolbar buttons | `useTranslation("actions")` in `*-components/table.tsx` |
| Table search + relevance min/max placeholders | `useTranslation("tables")` as `tTable` in `*-components/table.tsx` |

**`alerts.json` key naming:**

| Family | Pattern | Examples |
|--------|---------|----------|
| Entity CRUD (parameterized) | past-tense verb | `created`, `updated`, `batchDeleted` |
| Action pair (success + error) | `{verb}{Noun}Success` / `{verb}{Noun}Failed` | `tokenCopySuccess`, `tokenCopyFailed` |
| Standalone success | `{subject}{Action}Success` | `profileUpdateSuccess` |

**In scope (phase 3):**

| Area | Approach |
|------|----------|
| Form chrome | `forms.json`; `useTranslation("forms")` as `tForm` — `fields.<key>.label`, `.placeholder`, `.tooltip`; `batch.<key>.label` / `.tooltip`; sections, submit |
| Form validation (Zod) | Static English messages in schema constants; `hasUniqueLocales` in `lib/form-validation.ts`. Toast/ATS copy uses `tForm("validation.*")` with interpolation when needed (e.g. `descriptionMin`, `{ value: 64 }`; `fieldRequired`, `{ field: tForm("fields.courseTitle.label") }`) |
| AI textarea buttons | `tForm("ai.translate")`, `tForm("ai.optimize")` inside `textarea.tsx` |
| Form actions | Cancel via `tAction("cancel")`; profile mobile save via `tAction("saveChanges")` |
| Field arrays | Generic empty/add copy inside `field-array.tsx`; entity-specific `label` prop passed translated from parent |
| AI optimize/translate detail keys | English keys sent to API — not UI i18n |

**Explicitly out of scope (backlog — do not add without revisiting this ADR):**

- System header alerts (e.g. profile unsaved changes title)
- Tables: column headers, filter facet labels/dropdowns, enum labels in cells (search + relevance min/max placeholders are in scope via `tables`)
- Locale `es` in switcher / JSON (enum exists; not enabled in UI yet)
- API / backend error messages and toasts (`main.tsx` `toast.error(error.message)`)
- API recent-activity entity labels (`i18n[0]`) — optional API follow-up

## Phased delivery

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **1 — Foundation** | i18next setup, locale switcher, `help` + `nav` + `pages` namespaces (en + pt) | Done |
| **1 — Wiring** | Page copy, sidebar nav, `i18nLabel` + pickers + dayjs on active locale | Done |
| **2 — Chrome (non-form)** | `actions`, `alerts`, `dashboard`, `login`; shared buttons, toasts, table toolbar, dashboard widgets | Done |
| **3 — Form chrome** | `forms` namespace; all entity forms, login form, field-array, labels/placeholders/tooltips/submit, AI buttons, `fieldRequired` validation | Done |
| **3b — Table chrome (partial)** | `tables` search + relevance placeholders; static English `aria-label`s; removed `consts/placeholders.ts` | Done |
| **Later** | Table columns/filters (remaining), `es` UI | Backlog |

## Where to look

| Topic | Location |
|-------|----------|
| Entity translation pick | `src/lib/i18n.ts` |
| Locale init + persistence | `src/i18n/index.ts` |
| Relative time | `src/lib/dayjs.ts` (`syncDayjsLocale`) |
| Help content type | `src/consts/page-help.ts` (`PageHelpContent` interface) |
| Page help builder | `src/lib/page-help.ts` (`pageHelp(tHelp, section)`) |
| Locale array refine | `src/lib/form-validation.ts` (`hasUniqueLocales`) |

## Verification checklist

1. Display locale persists across refresh (`i18nextLng` in localStorage).
2. Skill labels in entity tables and pickers change when locale changes (no refetch).
3. Page help modal shows `pt` text when locale is `pt`.
4. CRUD page `PageTitle` and modal titles/descriptions show `pt` when locale is `pt`.
5. Sidebar nav labels show `pt` when locale is `pt`.
6. Dashboard `fromNow` strings follow display locale (e.g. `há 2 dias` in `pt`).
7. CRUD page buttons, modal actions, and success toasts show `pt` when locale is `pt`.
8. Dashboard stats/charts/recent activity, login page, and login form show `pt` when locale is `pt`.
9. Table toolbar buttons (`Update selected`, `clear all`, etc.) and search placeholder show `pt`; column headers and filter facet labels stay English.
10. Entity form labels, placeholders, tooltips, submit buttons, and AI textarea buttons show `pt`; Zod inline validation messages stay English; relevance min/max placeholders show `pt`.
11. `lib/i18n.ts` stays free of UI string keys.
12. No duplicate locale state on auth store.

## Related

- Content locales: `apps/api/src/common/i18n/locales.ts`
- Admin i18n backlog items also listed under **Deferred polish** in `apps/api/docs/BACKLOG.md`
