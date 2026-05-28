# Initial Audit — Locale Copy

Date: 2026-05-28
Branch: feat/premium-missing-locales-copy-hermes

## System i18n

- Library: custom JSON loading via `src/i18n/` (no next-i18next, no react-i18next)
- Locale files: `public/locales/<lang>/common.json`
- Active app locales before this PR: es, en, de
- Premium locales target: es → ca → en → de → fr → it → pt

## Locales found before work

| Locale | File present | Keys |
| --- | --- | --- |
| es | YES | 101 |
| en | YES | 101 |
| de | YES | 101 |
| ca | NO | — |
| fr | NO | — |
| it | NO | — |
| pt | NO | — |

## Legal content system

- File: `src/lib/legal-content.ts`
- Covers: `privacy`, `terms`, `legal` for es/en/de
- ca/fr/it/pt: NOT present before this PR

## Language toggle

- File: `src/lib/anclora-language-toggle.ts`
- `ACTIVE_APP_LOCALES` before: `['es', 'en', 'de']`
- ca/fr/it/pt marked `pending-copy` before this PR

## Manual documents

- `docs/manual/manual-usuario.md` (ES)
- `docs/manual/manual-usuario.en.md` (EN)
- `docs/manual/manual-usuario.de.md` (DE)
- CA/FR/IT/PT: NOT present (Phase 5 deferred — see gaps)

## Key observations

- 101 keys per active locale, all matching
- No i18n library dependency — loading is bespoke
- Legal content uses `AppLanguage` type (es/en/de only) — extended via new `LegalLanguage` type
