# Feature Spec v1: Calculator Value Clarity

## Problem

The public `/calculadora-ahorro` calculator was visually usable but conceptually unclear. The monthly spend field could be read as kWh, contracted power or money, while the engine expects a monthly bill amount. Results showed annual savings, cost and payback without enough context to explain the simulated measure, the basis of comparison or why a long payback may still be a valid result.

## Initial Audit

Current inputs: `propertyType`, `area`, `currentLetter`, `measure`, `monthlySpend`, `city`, `constructionYear`, `occupants`, `zipCode`, `heatingSystem`.

Supported measures: windows, insulation, heat pump, photovoltaic and deep retrofit.

Calculation before this change: monthly spend x 12 gives annual spend; measure savings rates apply to annual spend; measure cost rates apply per m2; construction year and heating system adjust savings rates; payback is cost divided by annual savings.

Current copy before this change: ES/EN/DE lived mainly in `src/lib/monetization/i18n.ts`; public JSON titles existed in `public/locales/{es,en,de}/common.json`. The visible cards used `Ahorro anual`, `Coste orientativo` and `Payback`.

Public links to the calculator: `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/app/sitemap.ts`, and product/manual documentation.

Existing tests: `tests/seo-calculator.test.ts` covered invalid surface validation, non-guaranteed ranges and sitemap inclusion. There were no React UI tests in the existing suite.

i18n, currency and unit limitations: calculator copy uses `getMonetizationCopy(language)` rather than the public JSON dictionary. Formatting helpers exist in `src/lib/formatters.ts` and preferences in `src/lib/preferences.ts`.

Currency before this change: result cards hardcoded `EUR`. Preferences support EUR/GBP, but the calculator cards did not use them.

GBP behavior after this change: internal calculation remains EUR-canonical. When GBP is active, the input displays GBP and converts back to EUR for calculation; result ranges use preference-aware formatting.

Mobile risk before this change: no automated UI tests existed. The old result cards were compact and lacked explanatory text; manual QA is required.

## Product Decisions

The calculator is repositioned as a public indicative economic range calculator. It does not calculate a new energy rating, replace the residential wizard, replace a technical quote, guarantee savings or decide whether a renovation is worth doing.

The calculator answers: if a user applies one concrete energy improvement, what approximate investment, annual savings and simple payback range could they expect?

Long payback remains visible. It is explained as a result that may point away from direct financial return and toward comfort, regulation, maintenance, sale/rental preparation or property value.

## Technical Changes

`calculateSavingsRange` now returns annual spend, effective savings rate range, payback category, viability, warning codes, interpretation keys and assumption values.

Payback categorization uses the midpoint of the payback range as a prudent summary:

- `fast`: up to 7 years
- `reasonable`: over 7 and up to 15 years
- `long`: over 15 and up to 30 years
- `very_long`: over 30 and up to 60 years
- `not_economic`: over 60 years or unavailable

The UI now renders explanatory cards for annual savings, indicative investment and simple economic payback, plus warnings, quick read, assumptions and CTAs to the wizard, Premium PDF pricing and Budget Review.

