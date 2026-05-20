# Execution Report — Residential Guest Pricing & Budget Review Contract

**Date:** 2026-05-20  
**Branch:** feat/residential-guest-pricing-budget-review-contract  
**Status:** Complete

---

## What was implemented

### Phase 0 — Audit
- Existing products.ts had only BUDGET_REVIEW_PRICE_CENTS, no structured product catalogue
- Budget Review launch price was 19.90 (changed to 14.90 launch / 19.90 standard)
- Checkout routes already had correct `productType` metadata
- Webhook already separated budget_review from premium_report correctly
- Footer already had Budget Review and Pricing links
- Navbar already had Budget Review in product dropdown

### Phase 1 — Spec
- Created `sdd/features/.../feature-...-spec-v1.md` with access matrix and product contract

### Phase 2 — products.ts
- Replaced ad-hoc price constants with structured `PRODUCTS` catalogue
- Added `free_diagnostic`, `premium_pdf`, `budget_review`, `residential_bundle`
- Added `includesPropertyDiagnosis()` and `includesBudgetReview()` contract helpers
- Kept legacy `BUDGET_REVIEW_PRICE_CENTS` export for backwards compatibility

### Phase 3 — .env.example
- Added `NEXT_PUBLIC_BUDGET_REVIEW_STANDARD_PRICE_EUR`
- Added `STRIPE_PRICE_RESIDENTIAL_BUNDLE`, `NEXT_PUBLIC_RESIDENTIAL_BUNDLE_LAUNCH_PRICE_EUR`, `NEXT_PUBLIC_RESIDENTIAL_BUNDLE_PRICE_EUR`

### Phase 4 — i18n (ES/EN/DE)
- Added 10 new keys to all three locale files in `public/locales/`
- Keys cover: use cases, product names, wizard context notice, Budget Review positioning, differentiation note, guest access notice

### Phase 5 — Landing page
- Added "Dos casos de uso residenciales" section between normativa and partners sections
- Two cards: "Analizar mi vivienda" → /wizard, "Revisar un presupuesto" → /budget-review
- PDF Premium demo link (functional API route)
- Budget Review demo link → /budget-review?demo=1
- Differentiation note in amber callout box

### Phase 6 — Pricing page
- Replaced 3-column grid with 4-column grid (Free, PDF Premium, Budget Review, Pack Reforma Inteligente)
- Prices read from PRODUCTS catalogue (env-driven, not hardcoded)
- Pack Reforma Inteligente shows "Próximamente" when STRIPE_PRICE_RESIDENTIAL_BUNDLE not set
- Separation note callout explaining Budget Review is not included in PDF Premium
- Guest access note with wizard CTA

### Phase 7 — Budget Review page
- New positioning title: "Segunda opinión sobre tu presupuesto de reforma"
- New intro text explaining independent use without wizard
- Differentiation note (amber callout) explaining Budget Review ≠ PDF Premium
- Legal limitation footer text

### Phase 8 — Wizard
- Added `wizardBudgetContextNotice` to i18n.ts (ES/EN/DE)
- Added contextual microcopy in `renderBudgetImportBlock()` in AssessmentWizard.tsx
- Added Budget Review upsell in `PaywallSection.tsx` when `hasBudgetAttached=true`
- Assessment page passes `hasBudgetAttached={rehabBudgets.length > 0}` to PaywallSection

### Phase 9 — Checkout/Webhook
- No changes needed: metadata and routing were already correct
- `premium_report` → Assessment, `budget_review` → BudgetReview (no mixing)

### Phase 10 — Navbar/Footer
- No changes needed: Budget Review and Pricing already present in both

### Phase 11 — Spanish Manual
- Section 1: Updated user profile table with guest/logged distinction; added differentiation note
- Section 3: Added guest access note (no account required)
- Section 4: Added wizard budget context notice
- Section 6: Added "revisión de presupuesto: No / No (Budget Review)" row; added Pack section 6.7
- Section 7: Rewrote intro with independent positioning
- Section 11: Added 4 new FAQ questions
- Section 12: Updated glossary with Budget Review, PDF Premium, Pack Reforma Inteligente
- Section 13: Added Budget Review legal limitation

### Phase 12 — PDF regeneration
- `npm run manual:pdf:es` — SUCCESS: `public/manuals/anclora-energyscan-manual-usuario-es.pdf`

### Phase 13 — Tests
- Created `tests/residential-product-contract.test.ts` (18 tests)
- Updated `tests/budget-review-checkout.test.ts` launch price: 19.90 → 14.90 (1990c → 1490c)
- Added `testPathIgnorePatterns` in jest.config.js to exclude locked worktree

### Phase 14 — Verification
- lint: PASS
- tsc --noEmit: PASS
- jest (relevant suites): 49 tests PASS
- build: PASS

---

## Decisions taken

| Decision | Rationale |
|----------|-----------|
| Budget Review launch price set to 14.90 | Differentiated from Premium PDF (9.90), natural upsell path |
| No guest token introduced | Existing flow already supports anonymous checkout via Stripe session |
| Pack Reforma Inteligente marked comingSoon | No STRIPE_PRICE_RESIDENTIAL_BUNDLE set; prevents broken checkout |
| Kept metadata.productType as `premium_report` (not `premium_pdf`) | Breaking change would affect webhook and existing paid assessments |
| Worktree excluded from jest via testPathIgnorePatterns | Locked worktree had stale test copies causing false failures |

---

## Pending / Requires human review

- EN/DE manual PDFs not regenerated (only ES was regenerated per task spec)
- Pack Reforma Inteligente needs a Stripe price ID before going live
- Budget Review demo mode (`?demo=1`) shows the uploader but no pre-loaded demo content — needs a demo fixture if desired
- Launch prices (9.90 / 14.90 / 19.90) are configurable via env vars and can be adjusted without code changes
