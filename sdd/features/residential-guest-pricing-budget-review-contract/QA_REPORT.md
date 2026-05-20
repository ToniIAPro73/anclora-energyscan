# QA Report — Residential Guest Pricing & Budget Review Contract

**Date:** 2026-05-20  
**Branch:** feat/residential-guest-pricing-budget-review-contract

---

## Automated QA

| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint` | PASS | No ESLint warnings or errors |
| `npx tsc --noEmit` | PASS | No TypeScript errors |
| `jest residential-product-contract` | PASS | 18 tests |
| `jest monetization-packaging` | PASS | 27 tests |
| `jest checkout.test` | PASS | 4 tests |
| `jest budget-review-checkout` | PASS | 1 test (1490 cents / 14.90 EUR) |
| `jest budget-review` | PASS | 2 tests |
| `jest stripe-webhook` | PASS | 4 tests |
| `npm run build` | PASS | All pages compiled |
| `npm run manual:pdf:es` | PASS | PDF regenerated |

---

## Manual QA checklist (to be verified by human)

- [ ] Landing: "Dos casos de uso" section renders correctly in light and dark mode
- [ ] Landing: "Analizar mi vivienda" CTA → /wizard
- [ ] Landing: "Revisar mi presupuesto" CTA → /budget-review
- [ ] Landing: PDF Premium demo link generates PDF (not broken)
- [ ] Landing: Budget Review demo link → /budget-review?demo=1 (no 404)
- [ ] Landing: Differentiation note visible in amber callout
- [ ] Pricing: 4-column grid renders on desktop and mobile
- [ ] Pricing: Free plan shows 0 €
- [ ] Pricing: PDF Premium shows 9,90 € (or env override)
- [ ] Pricing: Budget Review shows 14,90 € (or env override)
- [ ] Pricing: Pack Reforma Inteligente shows "Próximamente" (no checkout button)
- [ ] Pricing: Separation note visible
- [ ] Budget Review page: New title "Segunda opinión sobre tu presupuesto de reforma"
- [ ] Budget Review page: Amber differentiation note visible
- [ ] Budget Review page: Legal limitation text visible
- [ ] Wizard: Budget step shows amber contextual notice
- [ ] Wizard + Premium paywall: Budget Review upsell visible when budget attached
- [ ] Wizard + Premium paywall: No upsell when no budget attached
- [ ] Dashboard: Budget Review and PDF Premium appear as separate items
- [ ] Checkout: premium_report metadata flows through wizard → assessment paywall
- [ ] Checkout: budget_review metadata flows through budget-review page
- [ ] Webhook: premium_report updates Assessment, not BudgetReview
- [ ] Webhook: budget_review updates BudgetReview, not Assessment

---

## Known limitations

- EN/DE manuals not regenerated in this PR (only ES)
- Pack Reforma Inteligente does not have a working checkout (comingSoon=true)
- Budget Review demo mode (?demo=1) shows empty uploader, not a pre-loaded demo fixture
