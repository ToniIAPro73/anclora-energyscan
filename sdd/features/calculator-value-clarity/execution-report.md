# Execution Report

## Branch

Created and worked on `feat/calculator-value-clarity`.

Draft PR: https://github.com/ToniIAPro73/anclora-energyscan/pull/72

## Files Changed

- `src/lib/calculator/savings.ts`
- `src/components/monetization/SavingsCalculator.tsx`
- `src/lib/monetization/i18n.ts`
- `src/lib/formatters.ts`
- `public/locales/es/common.json`
- `public/locales/en/common.json`
- `public/locales/de/common.json`
- `docs/manual/manual-usuario.md`
- `docs/manual/manual-usuario.en.md`
- `docs/manual/manual-usuario.de.md`
- `tests/savings-calculator.test.ts`
- `tests/formatters-preferences.test.ts`
- SDD files under `sdd/features/calculator-value-clarity/`

## Implementation Notes

The underlying MVP calculation model remains unchanged: savings rates and cost-per-m2 ranges still drive the estimate. The change adds interpretation and formatting around that model.

The calculator is EUR-canonical internally. Preference-aware display is used for results and the input converts GBP back to EUR before calling the engine.

## Test Status

Initial targeted tests run:

- `npm test -- seo-calculator`: passed.
- `npm test -- savings-calculator`: initially failed because the sample did not actually fall into `very_long`; updated sample passed.
- `npx tsc --noEmit`: passed.

Full verification is recorded in `QA_REPORT.md`.
