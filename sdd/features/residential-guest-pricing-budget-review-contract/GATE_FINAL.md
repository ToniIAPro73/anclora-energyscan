# Gate Final — Residential Guest Pricing & Budget Review Contract

**Date:** 2026-05-20  
**Branch:** feat/residential-guest-pricing-budget-review-contract

---

## Acceptance Criteria

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Products defined in products.ts with env-driven prices | ✅ | PRODUCTS catalogue with free_diagnostic, premium_pdf, budget_review, residential_bundle |
| 2 | .env.example has all required Stripe/price vars | ✅ | Added BUDGET_REVIEW_STANDARD, RESIDENTIAL_BUNDLE vars |
| 3 | i18n ES/EN/DE have all new keys | ✅ | 10 new keys in each of the 3 locale files |
| 4 | Landing has "two use cases" block | ✅ | Home analysis + Budget Review section added |
| 5 | Landing has budget-vs-wizard differentiation note | ✅ | Amber callout box added |
| 6 | Pricing page has 4 products correctly defined | ✅ | Free, PDF Premium, Budget Review, Pack (comingSoon) |
| 7 | Budget Review page has independent positioning | ✅ | New title, intro, differentiation note, legal footer |
| 8 | Wizard budget step has contextual microcopy | ✅ | wizardBudgetContextNotice added to i18n + component |
| 9 | Wizard result/paywall has Budget Review upsell when budget attached | ✅ | hasBudgetAttached prop in PaywallSection |
| 10 | Checkout metadata distinguishes premium_report vs budget_review | ✅ | Already correct; verified by tests |
| 11 | Webhook routes without mixing Assessment and BudgetReview | ✅ | Already correct; verified by stripe-webhook tests |
| 12 | Footer has Budget Review and Pricing links | ✅ | Already present; no change needed |
| 13 | Spanish manual updated in all required sections | ✅ | Sections 1, 3, 4, 6, 7, 11, 12, 13 updated; PDF regenerated |
| 14 | Tests cover product definitions and separation | ✅ | 18 new tests in residential-product-contract.test.ts |
| 15 | lint + tsc + tests pass | ✅ | All green |

---

## Summary

All 15 acceptance criteria are met. The feature is ready for PR review.

Pending human decisions before merging to main:
- Set `STRIPE_PRICE_RESIDENTIAL_BUNDLE` in production to activate the Pack checkout
- Decide whether to build a Budget Review demo fixture for `?demo=1`
- Regenerate EN/DE manual PDFs if desired before release
