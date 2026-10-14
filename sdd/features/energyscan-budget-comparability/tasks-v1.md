# Tasks v1 — ES-1.2 budget comparability

## Decisions and discovery

- [x] Toni accepts the scope boundary between compatibility analysis and price-reference ratings.
- [x] Toni selects two budgets as the initial workflow.
- [x] Conservative dimensions fixed: category/unit/quantity; scope and VAT remain unknown.
- [x] Fixed aliases only, no conversions; VAT unknown; comparison remains transient.
- [x] Audit confirmed the original product handled one offer per review; comparison now uses a separate transient route.

## Synthetic evidence and tests

- [x] Added two synthetic text fixtures; their hash and current test evidence are recorded in `docs/VALIDATION_CHECKLIST.md`.
- [x] Added match/mismatch/unknown, duplicate, unmatched, fixture, and API abstention tests.
- [x] Asserted `NO_REFERENCE` and absence of price verdict/delta fields.
- [x] Added privacy sentinel assertion and localized comparison copy in all seven locales.

## Implementation and closure

- [x] Implemented typed comparison model and UI/API without provider or dependency additions.
- [x] No comparison data is persisted, so existing retention/deletion paths are unchanged.
- [x] No migration is required; rollback is reverting the application commit.
- [x] Record final gates, visual QA, fixture hashes, and implementation SHA in the validation checklist.
- [ ] Toni reviews and accepts the phase before any promotion.
