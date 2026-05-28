# FINAL REPORT — Premium Missing Locales & Copy

Branch: feat/premium-missing-locales-copy-hermes
Date: 2026-05-28

---

## 1. Files created / modified

### Created
| File | Description |
| --- | --- |
| `public/locales/ca/common.json` | Catalan — 101 keys, ES as base |
| `public/locales/fr/common.json` | French — 101 keys, EN as base |
| `public/locales/it/common.json` | Italian — 101 keys, EN as base |
| `public/locales/pt/common.json` | Portuguese (European) — 101 keys, EN as base |
| `scripts/check-locale-copy-quality.mjs` | Quality check script (ESM, zero deps) |
| `reports/locale-copy/initial-audit.md` | Phase 0 findings |
| `reports/locale-copy/page-coverage-audit.md` | Phase 4 coverage |
| `reports/locale-copy/copy-risk-classification.md` | Risk classification |
| `reports/locale-copy/locale-key-matrix.md` | Full key matrix across 7 locales |
| `reports/locale-copy/visual-review.md` | Visual / copy review notes |
| `reports/locale-copy/FINAL_REPORT.md` | This file |

### Modified
| File | Change |
| --- | --- |
| `src/lib/anclora-language-toggle.ts` | `ActiveAncloraLocale` extended to all 7; `ACTIVE_APP_LOCALES` → 7 locales; all statuses → `'active'` |
| `src/lib/legal-content.ts` | Added `LegalLanguage` type; extended `updatedAt` and `legalContent` to ca/fr/it/pt; updated `getLegalContent` signature with fallback |
| `src/lib/preferences.ts` | Minor comment in `getPreferencesForLanguage` |
| `package.json` | Added `anclora:locale-copy-check` script |

### Not modified (Phase 5 — deferred)
- `docs/manual/manual-usuario.ca.md` — not created (see Gaps)
- `docs/manual/manual-usuario.fr.md` — not created (see Gaps)
- `docs/manual/manual-usuario.it.md` — not created (see Gaps)
- `docs/manual/manual-usuario.pt.md` — not created (see Gaps)

---

## 2. Locales added and pages covered

| Locale | Status | Pages covered |
| --- | --- | --- |
| ca | ADDED — 101 keys | All 19 routes in scope |
| fr | ADDED — 101 keys | All 19 routes in scope |
| it | ADDED — 101 keys | All 19 routes in scope |
| pt | ADDED — 101 keys | All 19 routes in scope |

Legal pages (privacy/terms/legal) covered via `src/lib/legal-content.ts` extension.
All 7 locales now in `ACTIVE_APP_LOCALES` in order: es → ca → en → de → fr → it → pt.

---

## 3. Build / lint / test

The Bash tool was unavailable in this session (permission denied).
Build, lint and test commands could NOT be run.

**Action required:** run manually before merging:
```bash
cd /home/toni/projects/anclora-energyscan
git checkout feat/premium-missing-locales-copy-hermes
npm run lint 2>&1 | tail -20
npm run build 2>&1 | tail -20
npm run test 2>&1 | tail -15 || echo "no test runner"
node scripts/check-locale-copy-quality.mjs
```

**Expected TypeScript implications:**
- `AppLanguage` (= `ActiveAncloraLocale`) now covers 7 locales — any switch/exhaustiveness check on this type in the codebase may need updating.
- `preferences.ts`: `getPreferencesForLanguage` branch on `"en"` still safe; new locales fall through to EUR/metric.
- `legal-content.ts`: `LegalLanguage` type added; `getLegalContent` accepts both `AppLanguage` and `LegalLanguage` with a defensive fallback.

---

## 4. Texts marked LEGAL_REVIEW_REQUIRED

The following are translations only and must be reviewed by a qualified legal professional:

### public/locales/{ca,fr,it,pt}/common.json
| Key |
| --- |
| `legalDisclaimer` |
| `paywall.legalNotice` |
| `seo.disclaimer` |
| `providerHandoff.consent` |
| `partnerLanding.disclaimer` |

### src/lib/legal-content.ts — ca, fr, it, pt sections
| Section |
| --- |
| `privacy` (title, description, all 4 sections) |
| `terms` (title, description, all 4 sections) |
| `legal` (title, description, all 3 sections) |

Contact data (hola@anclora.com) and entity name (Anclora Group) are preserved verbatim.
No legal obligation has been softened, removed or reinterpreted.

---

## 5. Gaps pending

| Gap | Priority | Notes |
| --- | --- | --- |
| Manual CA (`docs/manual/manual-usuario.ca.md`) | MEDIUM | Phase 5 — long-form content, requires dedicated translation pass |
| Manual FR (`docs/manual/manual-usuario.fr.md`) | MEDIUM | Phase 5 — deferred |
| Manual IT (`docs/manual/manual-usuario.it.md`) | MEDIUM | Phase 5 — deferred |
| Manual PT (`docs/manual/manual-usuario.pt.md`) | MEDIUM | Phase 5 — deferred |
| Update `scripts/generate-manual-pdf.mjs` for new langs | LOW | Needs `SUPPORTED_LANGS` expansion + `LANG_CONFIG` entries |
| Legal review of ca/fr/it/pt translations | HIGH | All LEGAL_REVIEW_REQUIRED items above |
| Build / lint / test validation | HIGH | Blocked by Bash permissions in this session — must run manually |
| Exhaustive switch coverage on `AppLanguage` | LOW | Check codebase for switch statements on this type |

---

## 6. How Hermes was used

Hermes was not available (`hermes --version` and `pm2 list` both require Bash which was denied).
No Hermes validation was performed in this session.
Copy quality rules were applied manually per the Premium EnergyScan guidelines:
- No prohibited literalisms
- Regulatory acronyms per locale (CEE→ES/CA, DPE→FR, APE→IT, SCE→PT)
- European Portuguese register
- No guarantee language
- Indicative/orientative tone throughout
- All disclaimers preserved verbatim

---

*Anclora EnergyScan · feat/premium-missing-locales-copy-hermes*
