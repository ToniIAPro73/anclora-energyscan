# GATE FINAL: Professional Role Clarity

**Date:** 2026-05-21  
**Branch:** feat/professional-role-clarity  

---

## Acceptance criteria — status

| # | Criterion | Status |
|---|---|---|
| 1 | `/profesional` explains clearly what the professional profile is | ✅ |
| 2 | UI differentiates professional from residential and provider | ✅ |
| 3 | `/profesional/solicitar` explains beta access, states and orientative use | ✅ |
| 4 | `/profesional/dashboard` shows correct states: no session, no request, pending, rejected, approved | ✅ |
| 5 | Approved professional sees operational dashboard with own cases | ✅ |
| 6 | Cases presented as expedientes, not raw technical data | ✅ (getPropertyTypeLabel) |
| 7 | Budget Review appears as professional orientative tool | ✅ |
| 8 | Professional pricing shown as beta/upcoming | ✅ (planLegal copy) |
| 9 | Spanish manual aligned | ✅ (Section 8 rewritten) |
| 10 | i18n ES/EN/DE updated | ✅ |
| 11 | Tests passing | ✅ (39 professional tests) |
| 12 | TypeScript clean | ✅ (tsc --noEmit: 0 errors) |
| 13 | QA visual/manual documented | ✅ (Playwright 1.60, 12 screenshots) |
| 14 | SDD spec and QA report created | ✅ |
| 15 | Build successful | ✅ (npm run build: 0 errors) |
| 16 | Full test suite passing | ✅ (417 tests) |
| 17 | PR open | ✅ PR #75 |

---

## Pending

- Manual EN/DE update (deferred — ES is canonical, i18n keys are complete in EN/DE).
- Manual PDF regeneration (deferred — requires headless Puppeteer in environment).

---

## Decision log

- Professional = own assessments in MVP. Advanced client management deferred.
- No Stripe billing activated for plans. Shown as informative only.
- No new Prisma migration. Existing `role` and `message` fields reused.
- `getPropertyTypeLabel` used instead of raw enum values.
