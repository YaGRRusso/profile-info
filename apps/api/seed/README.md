# Dev seed

Wipes profile collections and inserts deterministic faker data plus fixed personas.
Entry: `npm run seed` (from repo root: `npm run api:seed`).

Password for all personas: `123123` (`DEV_PASSWORD` in `constants.ts`).

## Personas

| Key | Email | Role | LOCAL catalog | Private entities | Notes |
|-----|-------|------|---------------|------------------|-------|
| `empty` | empty@profile.info | USER | — | — | Empty profile |
| `lite` | lite@profile.info | USER | 2 skills, 1 org | 1 each | Minimal tenant |
| `joao` | joao@profile.info | USER | 4 skills, 2 orgs | moderate | QUERY + MUTATE API tokens |
| `maria` | maria@profile.info | USER | 4 skills, 2 orgs | moderate | Combined API token |
| `full` | full@profile.info | USER | 8 skills, 4 orgs | stress counts | Long display name |
| `admin` | admin@profile.info | SUPER_ADMIN | — | — | Owns GLOBAL catalog pool |

## Catalog layout

- **GLOBAL:** `CATALOG_SKILL_COUNT` (96) skills + `CATALOG_ORGANIZATION_COUNT` (32) orgs,
  created with `ownerId` = admin user.
- **LOCAL:** per persona counts in `personas.ts` → `localCatalog`. Slug offsets in
  `PERSONA_CATALOG_SEED_OFFSETS` avoid collisions across personas.
- **Disabled:** GLOBAL uses periodic flags (`index % 17` skills, `% 19` orgs). Each persona's
  **first LOCAL skill and first LOCAL org** is forced `disabled: true` for admin picker QA.
- **Profile skills:** `pickProfileSkillIds` skips disabled GLOBAL skills; entities may still
  reference disabled LOCAL refs via `pickSkillIds`.
- **i18n:** `en` and `pt` use separate faker streams (`faker` + `pt_BR`); titles and
  descriptions differ per locale (skills use locale-specific job titles).

## API tokens

Logged after seed (`SEED_API_TOKENS` in `constants.ts`). Send as header `X-Api-Key: pi_<id>_<secret>`.

## Tests

Contract tests: `test/seed/personas.spec.ts`, `test/seed/variation.helper.spec.ts`.
