# Feature Spec: Residential Guest Pricing & Budget Review Contract v1

**Date:** 2026-05-20  
**Branch:** feat/residential-guest-pricing-budget-review-contract  
**Status:** Implementation

---

## 1. Core Conceptual Rule (NON-NEGOTIABLE)

```
El presupuesto subido en el wizard contextualiza el informe energético.
Budget Review revisa el presupuesto como documento económico/técnico independiente.
```

These are two distinct products. A budget upload during the wizard is contextual data for the energy report. Budget Review is a standalone second-opinion service for renovation quotes.

---

## 2. Access Permission Matrix

| Action | Residential Guest (not logged in) | Residential Logged In | Professional Beta | Provider | Admin |
|--------|----------------------------------|----------------------|-------------------|----------|-------|
| Landing page | ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| Energy calculator | ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| Wizard (full flow) | ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| Free diagnostic result | ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| Basic PDF download | ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| PDF Premium (pay) | ALLOWED (pay) | ALLOWED (pay) | ALLOWED | ALLOWED | ALLOWED |
| Budget Review demo | ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| Budget Review (pay) | ALLOWED (pay) | ALLOWED (pay) | ALLOWED | ALLOWED | ALLOWED |
| Dashboard | NOT ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| Assessment history | NOT ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| Professional panel | NOT ALLOWED | Gate | ALLOWED | NOT ALLOWED | ALLOWED |
| Provider panel | NOT ALLOWED | NOT ALLOWED | NOT ALLOWED | ALLOWED | ALLOWED |
| Admin panels | NOT ALLOWED | NOT ALLOWED | NOT ALLOWED | NOT ALLOWED | ALLOWED |

---

## 3. Product Separation: PDF Premium vs Budget Review

### PDF Premium Residencial
- **What it is:** Full energy pre-assessment report for a specific property
- **Content:** Complete improvement scenarios, indicative costs, regulatory context, applicable grants, AI analysis, downloadable PDF
- **Does NOT include:** Line-by-line review of renovation quotes, economic/technical review of a specific contractor quote
- **Entry point:** Wizard → result → paywall

### Budget Review Premium
- **What it is:** Independent second-opinion on a specific renovation budget document
- **Content:** Line item analysis, totals detection, alerts, confidence, PDF report
- **Does NOT include:** Full home energy diagnosis, scenario analysis, energy letter calculation
- **Entry point:** /budget-review (can be accessed without doing the wizard)
- **Price:** 14,90 EUR launch / 19,90 EUR standard (SEPARATE from PDF Premium)

### Pack Reforma Inteligente
- **What it is:** Bundle of PDF Premium + Budget Review
- **Price:** 19,90 EUR launch / 29,90 EUR standard
- **Status:** Coming soon if STRIPE_PRICE_RESIDENTIAL_BUNDLE is not set

---

## 4. Anonymous User (Guest) Technical Decisions

### Strategy: Soft-gate with post-checkout recovery
- Users can complete the wizard and get a free result WITHOUT an account
- For PDF Premium: assessment is saved to DB before checkout (existing flow)
- For Budget Review: budget document is saved to DB before checkout (existing flow)
- After payment, user receives access via session_id URL parameter (existing flow)
- Account creation is RECOMMENDED but NOT REQUIRED to use the product

### Guest Token approach
- No guest token is introduced in this version
- Payment flow already works anonymously via Stripe session
- Assessment/BudgetReview records are created without userId when not logged in (nullable userId fields exist)

---

## 5. Product Definitions (products.ts)

```typescript
free_diagnostic: { price: 0, stripePrice: null }
premium_pdf: { launchPrice: 9.90, standardPrice: 14.90, stripePrice: env.STRIPE_PRICE_PREMIUM }
budget_review: { launchPrice: 14.90, standardPrice: 19.90, stripePrice: env.STRIPE_PRICE_BUDGET_REVIEW }
residential_bundle: { launchPrice: 19.90, standardPrice: 29.90, stripePrice: env.STRIPE_PRICE_RESIDENTIAL_BUNDLE, comingSoon: !env.STRIPE_PRICE_RESIDENTIAL_BUNDLE }
```

---

## 6. Stripe Metadata Product Types

| Product | metadata.productType |
|---------|---------------------|
| PDF Premium | `premium_report` (existing, do not change) |
| Budget Review | `budget_review` (existing, correct) |
| Residential Bundle | `residential_bundle` (future) |
| Provider Lead Pack | `provider_lead_pack` (existing) |

Webhook correctly routes:
- `budget_review` → updates `BudgetReview` record
- `premium_report` → updates `Assessment` record
- No mixing of these two resources

---

## 7. Wizard Budget Context vs Budget Review

When a user attaches a budget PDF in the wizard:
- The budget is analyzed for contextual energy measures and estimated impact
- The data contextualizes improvement scenarios in the energy report
- This is NOT equivalent to a Budget Review (no line-by-line analysis, no pricing signals, no independent opinion)
- Microcopy must make this distinction explicit

---

## 8. Demo Links Policy

- PDF Premium demo: `/api/assessment/demo/pdf` (existing, functional)
- Budget Review demo: `/budget-review?demo=1` as fallback (no dedicated demo page exists)
- Demo links must not be broken

---

## 9. Acceptance Criteria (15 criteria)

1. Products defined in products.ts with env-driven prices
2. .env.example has all required Stripe/price vars
3. i18n ES/EN/DE have all new keys
4. Landing has "two use cases" block (home analysis + budget review)
5. Landing has budget-vs-wizard differentiation note
6. Pricing page has 4 products correctly defined
7. Budget Review page has independent positioning
8. Wizard budget step has contextual microcopy
9. Wizard result/paywall has Budget Review upsell when budget attached
10. Checkout metadata distinguishes premium_report vs budget_review
11. Webhook correctly routes without mixing Assessment and BudgetReview
12. Footer has Budget Review and Pricing links
13. Spanish manual updated in all required sections
14. Tests cover product definitions and separation
15. lint + tsc + tests pass
