# Test Plan v1: Calculator Value Clarity

## Unit Tests

- Validate the calculator still returns ranges and a non-guaranteed disclaimer.
- Validate `annualSpend = monthlySpend x 12`.
- Validate `estimatedSavingsRateRange` is returned.
- Validate `paybackCategory` and `viability`.
- Validate midpoint payback above 30 years maps to `very_long`.
- Validate midpoint payback above 60 years maps to `not_economic`.
- Validate low monthly spend plus deep retrofit warning.
- Validate heat pump over an existing heat pump warning.
- Validate basic input quality warning and no guarantee language.
- Validate Zod schema rejection still works.
- Validate assumptions and assumption values exist.
- Validate GBP conversion helper round-trips.

## UI QA

Automated React UI tests are not present in the current repository. Manual browser QA covers:

- Clear monthly bill amount label.
- No ambiguous "Gasto energético mensual" label.
- Result includes selected measure.
- Cards have subtitles and explanatory footers.
- Long payback warning appears.
- Quick read block appears.
- Assumptions block appears.
- CTAs to wizard, pricing/PDF Premium and Budget Review appear.
- Mobile light/dark layout has no horizontal scroll.

## Verification Commands

- `npm test -- savings-calculator`
- `npm test -- seo-calculator`
- `npm test -- formatters-preferences`
- `npm test -- calculator`
- `npm run lint`
- `npm test`
- `npm run build`
- `npx tsc --noEmit`
- `npm run manual:pdf:es`

