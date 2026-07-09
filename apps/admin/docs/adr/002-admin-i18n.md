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

`stores/locale.ts` (`useLocaleStore`) is the **single source of truth** for the active locale. It
drives `i18nLabel` (default when no locale arg), `react-i18next`, and `dayjs` relative
time (`lib/dayjs.ts` → `syncDayjsLocale`).

## Decision

### Display locale (Zustand — not i18next)

- Persisted store `stores/locale.ts` (`useLocaleStore`, `LocaleEnum` — same as profile content / CV export).
- Sidebar switcher next to theme.
- `setLocale` updates the store, `i18n.changeLanguage`, and `syncDayjsLocale`.
- Drives entity labels via `i18nLabel` / `pickTranslation` (tables, pickers, modals).
- Does **not** translate table headers, filters, form field labels, or buttons.

### UI strings (react-i18next)

- `i18next` + `react-i18next`; init in `src/i18n/index.ts`, imported from `main.tsx`.
- Namespaces (v1): `help`, `nav`, `pages`.

**In scope (shipped in phase 1):**

| Area | Approach |
|------|----------|
| Page help | `help.json`; `usePageHelp(key)` |
| Page / modal titles & descriptions | `pages.json`; `usePageCopy(key)` on CRUD routes; `useTranslation("pages")` for home/settings titles |
| Sidebar nav | `nav.json`; `useTranslation("nav")` in `_sidebar.tsx` |
| Entity i18n labels | `i18nLabel(item)` defaults to `useLocaleStore.getState().locale`; tables may pass locale explicitly |
| Skill pickers in forms | `i18nLabel(skill, locale)` in options; `useLocaleStore` selector in `useMemo` deps |
| Relative timestamps | `formatRelativeTime` via `dayjs` synced to display locale |

**Explicitly out of scope (backlog — do not add without revisiting this ADR):**

- Form chrome: field labels, placeholders, validation messages (non-picker)
- Tables: column headers, filters, toolbar, enum labels in cells
- Dashboard widgets (stats, charts, greeting inside cards) — page title/description localized; relative time only elsewhere
- Buttons, selects, login, toasts, alerts actions
- Locale `es` in switcher / JSON (enum exists; not enabled in UI yet)
- API / backend error messages and toasts (belong on API layer)
- API recent-activity entity labels (`i18n[0]`) — optional API follow-up

## Phased delivery

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **1 — Foundation** | i18next setup, display locale store + switcher, `help` + `pages` namespaces (en + pt) | Done |
| **1 — Wiring** | `usePageHelp` / `usePageCopy` on entity pages + settings; `i18nLabel` + pickers + dayjs on display locale | Done |
| **Later** | Form chrome, table chrome, dashboard copy, nav, toasts, `es` UI | Backlog |

## Where to look

| Topic | Location |
|-------|----------|
| Entity translation pick | `src/lib/i18n.ts` |
| Display locale | `src/stores/locale.ts` (`useLocaleStore`) |
| Relative time | `src/lib/dayjs.ts` (`syncDayjsLocale`) |
| i18next init | `src/i18n/index.ts` |
| Sidebar nav | `src/locales/<locale>/nav.json` |
| Help keys | `src/consts/page-help.ts` (`PageHelpKey` only) |
| Page copy hook | `src/hooks/custom/use-page-copy.ts` |

## Verification checklist

1. Display locale persists across refresh.
2. Skill labels in entity tables and pickers change when locale changes (no refetch).
3. Page help modal shows `pt` text when locale is `pt`.
4. CRUD page `PageTitle` and modal titles/descriptions show `pt` when locale is `pt`.
5. Sidebar nav labels show `pt` when locale is `pt`.
6. Dashboard `fromNow` strings follow display locale (e.g. `há 2 dias` in `pt`).
7. Table headers / filters / form field labels stay English.
8. `lib/i18n.ts` stays free of UI string keys.
9. No duplicate locale state on auth store.

## Related

- Content locales: `apps/api/src/common/i18n/locales.ts`
- Admin i18n backlog items also listed under **Deferred polish** in `apps/api/docs/BACKLOG.md`
