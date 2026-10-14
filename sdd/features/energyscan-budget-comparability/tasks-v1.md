# Tasks v1 — ES-1.2 budget comparability

## Decisions and discovery

- [ ] Toni accepts the scope boundary between compatibility analysis and price-reference ratings.
- [ ] Toni selects the initial workflow: compare two offers, or assess completeness/differences within one offer.
- [ ] Toni approves mandatory comparison dimensions and the initial scope catalog.
- [ ] Toni approves unit aliases and confirms whether v1 needs any unit conversions.
- [ ] Toni confirms VAT handling and whether persistence should remain derived at read time.
- [ ] Audit whether the existing product supports two offers in a single review flow; record concrete routes and payloads.

## Synthetic evidence and tests

- [ ] Create synthetic fixtures only after decisions are resolved; include mixed units, VAT states, scope inclusions/exclusions, missing data, and ambiguous descriptions.
- [ ] Add tests first for match/mismatch/unknown per dimension and overall abstention.
- [ ] Assert no `HIGH_REVIEW`, `LOW_REVIEW`, `IN_RANGE`, expensive/cheap wording, or numerical verdict without an approved reference dataset.
- [ ] Add localization and privacy sentinel tests for any new user-facing copy/logging.

## Implementation and closure

- [ ] Implement the typed comparison model and accepted UI/API flow without expanding provider or dependency scope.
- [ ] Confirm data retention and deletion continue to cover any persisted derived comparison data.
- [ ] Assess migration need and rollback; if required, meet `QA_MINIMUM_FOR_DATABASE_MIGRATION=FULL`.
- [ ] Update the spec status and execution report with fixture hashes, denominators, gates, and SHA.
- [ ] Complete the validation checklist; get Toni's acceptance before promotion.
