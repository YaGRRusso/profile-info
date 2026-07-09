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
| **Entity display** | Skill title in a table cell | `lib/i18n.ts` (`pickTranslation`, `i18nLabel`) |
| **UI copy** | Page help, page/modal titles and descriptions | `react-i18next` + JSON under `src/locales/` |

`i18nLabel` defaults to `"en"` when no locale is passed. Tables call it without a locale
today, so translated skill names always follow English fallback order.

## Decision

### Display locale (Zustand — not i18next)

- Persisted store `stores/display-locale.ts` (`LocaleEnum`, same as profile content / CV export).
- Sidebar switcher next to theme.
- **Only** drives `i18nLabel` / `pickTranslation` where entity data is shown (v1: **tables**).
- Does **not** translate table headers, filters, or buttons.

### UI strings (react-i18next)

- `i18next` + `react-i18next`; init in `src/i18n/index.ts`, imported from `main.tsx`.
- Namespaces (v1): `help`, `pages`.
- `stores/display-locale.ts` is the **single source of truth**; `setLocale` also calls
  `i18n.changeLanguage`.

**In scope (incremental):**

| Area | Approach |
|------|----------|
| Page help | `help.json`; `usePageHelp(key)` |
| Page / modal titles & descriptions | `pages.json`; `usePageCopy(key)` on CRUD + settings routes |
| Entity fields in tables | Pass `displayLocale` into `i18nLabel` |

**Explicitly out of scope (do not add without revisiting this ADR):**

- Forms: labels, inputs, placeholders, validation messages
- Tables: column headers, filters, toolbar, enum labels in cells
- Dashboard (stats, charts, recent activity, greeting)
- Buttons, selects, sidebar nav, login, toasts, alerts actions
- API / backend error messages and toasts (belong on API layer)

## Phased delivery

| Phase | Deliverable |
|-------|-------------|
| **1 — Foundation** | i18next setup, display locale store + switcher, `help` + `pages` namespaces (en + pt) |
| **1 — Wiring** | `usePageHelp` / `usePageCopy` on entity pages + settings; `i18nLabel(..., displayLocale)` in tables |
| **Later** | Forms pickers, dashboard, chrome, toasts — only after phase 1 is stable |

## Where to look

| Topic | Location |
|-------|----------|
| Entity translation pick | `src/lib/i18n.ts` |
| Display locale | `src/stores/display-locale.ts` |
| i18next init | `src/i18n/index.ts` |
| Help keys | `src/consts/page-help.ts` (`PageHelpKey` only) |
| Page copy hook | `src/hooks/custom/use-page-copy.ts` |

## Verification checklist

1. Display locale persists across refresh.
2. Skill labels in entity tables change when locale changes (no refetch).
3. Page help modal shows `pt` text when locale is `pt`.
4. CRUD page `PageTitle` and modal titles/descriptions show `pt` when locale is `pt`.
5. Table headers / filters / buttons stay English.
6. `lib/i18n.ts` stays free of UI string keys.
7. No duplicate locale state on auth store.

## Related

- Content locales: `apps/api/src/common/i18n/locales.ts`
- API recent-activity labels (`i18n[0]`) — optional follow-up, not admin UI i18n
