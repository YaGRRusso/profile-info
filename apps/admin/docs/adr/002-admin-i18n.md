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

- Namespaces: `help`, `nav`, `pages`, `actions`, `alerts`, `dashboard`, `auth`, `forms`, `tables`, `system`, `validation`.

#### `useTranslation` aliases (always prefixed — never bare `t`)

| Context | Hooks (fixed order) | Example call |
|---------|---------------------|--------------|
| CRUD route | `tAction`, `tAlert`, `tPage`, `tHelp` | `tPage("courses.manageTitle")` |
| CRUD route + `i18nLabel` in modals | above, then `i18n` / `locale` | `i18nLabel(skill, locale)` |
| Settings / home route | `tPage`, `tHelp`, `tAlert` (omit unused) | `tPage("settings.title")` |
| System header alerts | `tSystem` at call site; store holds `title` / `description` | `title: tSystem("profileUnsaved")` |
| Table toolbar | `tAction` only | `tAction("clearAll")` |
| Table search / range placeholders | `tTable` | `tTable("search")`; `FiltersRange` uses `tTable("rangeMin"|"rangeMax")` internally |
| Table + `i18nLabel` in cells | `tAction`, `tTable`, then `i18n` / `locale` | `i18nLabel(skill, locale)` |
| Actions chrome (modal backdrop, download CV, profile save) | `tAction` | `tAction("close")` |
| Sidebar nav | `tNav` | `tNav("skills")` |
| Dashboard widgets | `tDashboard` | `tDashboard("stats.skills")` |
| Auth page | `tAuth` (+ `tForm` in `SignInForm` / `SignUpForm`) | `Auth` orchestrates `SignIn` / `SignUp`; `tAuth("signInTitle"|"signUpTitle")`, `tForm("fields.email.label")`, `tAlert("signUpSuccess")` |
| Entity forms | `tForm`, `tAction`, `tValidation` | `tForm("fields.slug.label")`, `tValidation("requiredField")` |

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
| Auth chrome | `auth.json` — sign-in / sign-up titles; `SignInForm` / `SignUpForm` in `forms.json` |
| Table toolbar buttons | `useTranslation("actions")` in `*-components/table.tsx` |
| Table search + range min/max placeholders | `useTranslation("tables")` as `tTable` — search in `*-components/table.tsx`; `rangeMin`/`rangeMax` inside `FiltersRange` |

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
| Field tooltips | Explain what the field **is** and what it is **for** — not optional/required, validation, format rules, or UI instructions |
| Page help copy | `help.json` paragraphs + `pages.json` descriptions — same bar as tooltips, plus persona-inclusive plain language (see below) |
| Form validation (Zod) | `FormError` keys in static schemas; `invalidFormat` (shape), `invalidRange` (intervals), `invalidField` (other); `fieldError` → `i18n.t(key, { ns: "validation" })` |
| AI/ATS validation toasts | `tValidation("minLength", { value })` for text; `tValidation("minCount", { value: 1 })` for skills; `tValidation("requiredField")` |
| AI textarea buttons | `tForm("ai.translate")`, `tForm("ai.optimize")` inside `textarea.tsx` |
| Multi-select chrome | `tForm("multiSelect.*")`, `tAction("clearAll")` inside `multi-select.tsx` |
| System header alerts | `system.json`; callers pass resolved `title` / `description` via `tSystem` |
| Form actions | Cancel via `tAction("cancel")`; profile mobile save via `tAction("saveChanges")` |
| Field arrays | Generic empty/add copy inside `field-array.tsx`; entity-specific `label` prop passed translated from parent |
| AI optimize/translate detail keys | English keys sent to API — not UI i18n |

**Explicitly out of scope (backlog — do not add without revisiting this ADR):**

- Tables: column headers, filter facet labels/dropdowns, enum labels in cells (search + relevance min/max placeholders are in scope via `tables`)
- Locale `es` in switcher / JSON (enum exists; not enabled in UI yet)
- API / backend error messages and toasts (`main.tsx` `toast.error(error.message)`)
- Route error boundaries (`error.tsx`)

## Phased delivery

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **1 — Foundation** | i18next setup, locale switcher, `help` + `nav` + `pages` namespaces (en + pt) | Done |
| **1 — Wiring** | Page copy, sidebar nav, `i18nLabel` + pickers + dayjs on active locale | Done |
| **2 — Chrome (non-form)** | `actions`, `alerts`, `dashboard`, `auth`; shared buttons, toasts, table toolbar, dashboard widgets | Done |
| **3 — Form chrome** | `forms` namespace; all entity forms, auth forms, field-array, labels/placeholders/tooltips/submit, AI buttons | Done |
| **3b — Table chrome (partial)** | `tables` search + relevance placeholders; static English `aria-label`s; removed `consts/placeholders.ts` | Done |
| **3c — System alerts + multi-select** | `system.json`; `multiSelect` in `forms`; profile unsaved banner | Done |
| **4a — Form error codes** | `FormError` in `lib/form-errors.ts`; all Zod schemas use keys (no inline English) | Done |
| **4b — Form error i18n** | `validation` namespace; `fieldError` + `tValidation` in toasts | Done |
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
| Form error codes | `src/lib/form-errors.ts` (`FormError`) |
| Field error display | `src/lib/field-error.ts` |

### `FormError` taxonomy (`validation.json`)

| Key | Use when |
|-----|----------|
| `requiredField` | Scalar missing / empty |
| `requiredGroup` | Array must have ≥1 entry (`i18n[]`, `roles[]`) |
| `minLength` / `maxLength` | String character bounds (`{{value}}`) |
| `minCount` / `maxCount` | Array selection bounds (`{{value}}`) |
| `minValue` / `maxValue` | Numeric bounds (`{{value}}`) |
| `invalidFormat` | Shape/format wrong — regex, email, url |
| `invalidRange` | Interval relation wrong — `from > to`, etc. |
| `invalidField` | Other business-rule invalidity (reserve; prefer specific keys above) |
| `uniqueField` | Duplicate within the same form (e.g. repeated locale) |
| `existingField` | Conflicts with persisted data (e.g. slug taken) |

New keys: name by validation category, not field or entity; must appear in 2+ places or fill a gap the generics cannot cover.

### Help and page description copy

Three layers — do not mix roles:

| Layer | Keys | Role |
|-------|------|------|
| Page subtitle | `pages.*.description`, `pages.*.manageDescription` | One self-contained sentence when the page opens |
| Help modal | `help.*.paragraphs` (via `pageHelp`) | Several short paragraphs in the `?` modal — more descriptive than tooltips; answer likely questions in plain language |
| Field tooltip | `forms.fields.*.tooltip` | One sentence per field |

Shared rules (all three layers): no examples in tooltips or subtitles (those belong in placeholders), no validation or optional/required rules, no UI walkthroughs.

**Length by layer:** field tooltips and page subtitles stay to one short sentence; help modal paragraphs may be longer and more descriptive — that is the place to clarify entity purpose, differences (e.g. courses vs educations), and how data appears on the exported CV.

**Persona-inclusive plain language** (profile users span many education levels and tech familiarity):

1. **Concrete before abstract** — real-world terms (job, school, certificate) before app structure.
2. **No meta-language** — do not reference other screens or entity names without a plain-word gloss ("empregos", "estudos", "cursos rápidos").
3. **No negative explanations** — say what something *is*, not what it is not.
4. **English only when clearer** — keep CV, link, PDF, e-mail, status where natural in pt-BR; avoid tag/script/API on universal screens; API token screens may use token/API with a plain first sentence of purpose.
5. **Preferred pt vocabulary in help/descriptions** (nav labels may stay shorter):

| Entity (nav) | Prefer in help / subtitles |
|--------------|----------------------------|
| Experiences | empregos e trabalhos |
| Educations | estudos formais |
| Organizations | empresas e escolas |
| Projects | trabalhos por conta própria |
| Skills | o que você sabe fazer |

6. **API tokens** — slightly more technical is acceptable; the first sentence must still say who needs it in plain language.

## Verification checklist

1. Display locale persists across refresh (`i18nextLng` in localStorage).
2. Skill labels in entity tables and pickers change when locale changes (no refetch).
3. Page help modal shows `pt` text when locale is `pt`.
4. CRUD page `PageTitle` and modal titles/descriptions show `pt` when locale is `pt`.
5. Sidebar nav labels show `pt` when locale is `pt`.
6. Dashboard `fromNow` strings follow display locale (e.g. `há 2 dias` in `pt`).
7. CRUD page buttons, modal actions, and success toasts show `pt` when locale is `pt`.
8. Dashboard stats/charts/recent activity, auth page, and auth forms show `pt` when locale is `pt`.
9. Table toolbar buttons (`Update selected`, `clear all`, etc.) and search placeholder show `pt`; column headers and filter facet labels stay English.
10. Entity form labels, placeholders, tooltips, submit buttons, and AI textarea buttons show `pt`; Zod field errors and AI validation toasts show `pt` via `validation` namespace; relevance min/max placeholders show `pt`.
11. `lib/i18n.ts` stays free of UI string keys.
12. No duplicate locale state on auth store.

## Related

- Content locales: `apps/api/src/common/i18n/locales.ts`
- Admin i18n backlog items also listed under **Deferred polish** in `apps/api/docs/BACKLOG.md`
