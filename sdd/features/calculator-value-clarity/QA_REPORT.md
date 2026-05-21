# QA Report

## 1. Initial Problem

The calculator asked for a vague monthly energy spend and presented three numeric cards without enough context. Long payback could look like a bug.

## 2. Product Changes

The feature is now a public indicative economic range calculator for one selected measure. It explains scope and limitations before the form.

## 3. Copy Changes

The monthly field now asks for average monthly energy bill amount and explicitly says not to enter kWh or contracted power. Measure labels describe actions. Result copy explains savings, investment and simple payback.

## 4. Calculation Output

The engine now returns `annualSpend`, `estimatedSavingsRateRange`, `paybackCategory`, `viability`, warning codes and assumption values.

## 5. Payback Categorization

Payback category is based on the midpoint of the returned payback range: fast, reasonable, long, very long or not economic.

## 6. Warnings

Warnings were added for very long payback, low spend plus deep retrofit, basic input quality and heat pump already installed.

## 7. UI Changes

The result area now shows selected measure context, explanatory cards, warnings, quick read, assumptions and CTAs to wizard, pricing/PDF Premium and Budget Review.

## 8. i18n Changes

Visible calculator copy was updated in ES/EN/DE in `src/lib/monetization/i18n.ts`. Public JSON calculator titles were also updated.

## 9. Manual Changes

The manual calculator section was updated in ES/EN/DE. It explains that the calculator is orientative and that long payback can still be meaningful for non-savings reasons.

## 10. Tests

Added `tests/savings-calculator.test.ts` and updated `tests/formatters-preferences.test.ts`.

## 11. Visual QA

Manual browser QA on `http://localhost:3000/calculadora-ahorro` with Playwright:

- Case 1, flat 45 m2, E, deep retrofit, 66 EUR/month: passed. Field is clear, result names deep retrofit, payback is long and explained, quick read appears, assumptions appear, CTAs appear.
- Case 2, flat 80 m2, E, insulation, 180 EUR/month, 1975, occupants, postcode and gas boiler: passed. High precision badge appears with no-guarantee note. Payback copy is different from case 1.
- Case 3, house 140 m2, E, photovoltaic, 220 EUR/month: passed. Result names photovoltaic and investment is framed as the selected measure.
- Basic vs advanced: passed. Basic shows a broad-result warning; advanced/full shows high precision plus no-guarantee note.
- GBP/EN preference: passed. Input label switches to GBP and `£/month`; result formatting uses preferences.
- Mobile 390x844 dark: passed after fixing form grid overflow. `scrollWidth` equals viewport width.
- Mobile 390x844 light: passed. `scrollWidth` equals viewport width.
- Desktop 1440px dark: passed. `scrollWidth` equals viewport width.

## 12. Commands

- `git status --short`: clean at audit start.
- `git branch --show-current`: `main` at audit start; branch created as `feat/calculator-value-clarity`.
- `git log --oneline --decorate -5`: recorded latest main history.
- `cat package.json`: inspected scripts and dependencies.
- `find src tests public docs -maxdepth 6 -type f | sort | sed 's#^./##' | head -700`: inspected file inventory.
- `rg -n "calculadora|calculator|SavingsCalculator|calculateSavingsRange|monthlySpend|gasto energético|Ahorro anual|Coste orientativo|Payback|payback|measureWindows|measureInsulation|measureHeatPump|measurePv|measureDeepRetrofit" src tests public docs`: inspected references.
- `npm test -- savings-calculator`: passed.
- `npm test -- seo-calculator`: passed.
- `npm test -- formatters-preferences`: passed.
- `npm test -- calculator`: passed, 2 suites and 15 tests.
- `npm run lint`: passed.
- `npm test`: passed, 58 suites and 386 tests.
- `npx tsc --noEmit`: passed. There is no dedicated `typecheck` script.
- `npm run build`: passed.
- `npm run manual:pdf:es`: passed once and regenerated `public/manuals/anclora-energyscan-manual-usuario-es.pdf`; later repeat failed with Chrome headless `SIGSEGV`.
- `npm run dev`: passed at `http://localhost:3000`.

## 13. Limitations

There is no existing React UI test infrastructure in the repository. UI behavior is covered by manual QA and logic tests.

`npm run manual:pdf:es` was successful once, then failed on repeat because `/usr/bin/google-chrome` crashed with `SIGSEGV` while printing the PDF. The Markdown manual changes are present.

## 14. Risks

GBP input conversion depends on the configured EUR/GBP rate, defaulting to the existing formatter rate if no environment value is provided.
