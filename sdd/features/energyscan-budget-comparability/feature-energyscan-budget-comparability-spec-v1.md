# ES-1.2 — Budget comparability and scope normalization

**Status:** ES-1.2 implementation complete on `development`; Toni acceptance pending. Comparison workflow confirmed as two user-provided budgets. Conservative defaults below are fixed for v1.
**Phase:** F1 · **Depends on:** ES-1.1; F0-R09; any price reference source must be separately approved and governed.

## 1. Problem and objective

ES-1.1 extracts and localizes budget line items. Budget Review currently abstains from price judgments and labels each line `NO_REFERENCE`. It can show category-level omissions and questions, but it does not establish that two line items cover the same work, measurement basis, tax treatment, or exclusions.

ES-1.2 will make the basis for a comparison explicit. It must identify missing or conflicting comparison fields and explain when two items cannot be compared. It must not infer that a price is high, low, fair, or a market price from incomplete or incompatible data.

## 2. Proposed product boundary

- Compare two user-provided budget texts in one transient session. Do not imply that one uploaded budget is a comparison against other offers or against a market benchmark.
- Treat description/category, unit and quantity basis, included work, exclusions, and VAT treatment as comparison dimensions. Missing or uncertain values remain unknown; they are never silently defaulted.
- Normalize only explicit, deterministic unit aliases. Do not convert dimensions or quantities unless an approved conversion rule and its evidence are recorded.
- Keep price assessment at `NO_REFERENCE` unless an independently approved, provenance-bearing reference set satisfies the comparison dimensions. ES-1.2.R is separate and is not authorized by this spec.
- Return the comparison in the current response and browser session only. Do not persist either input, the parsed lines, or comparison results, and do not add a database migration.
- Keep the workflow within existing application code and current parsing libraries. No new external provider, paid service, or dependency. Any exception requires Toni's explicit approval and a prior comparison.

Toni confirmed the two-budget workflow. Scope and VAT fields are not currently extracted, so v1 reports them as `UNKNOWN`, never claims full scope comparability, and does not calculate a price difference or rating.

## 3. Scope

**In scope:** a deterministic two-budget text comparison; exact normalized-description pairing; dimension-level match, mismatch, and unknown states for category, unit, quantity, scope, and VAT; side-by-side display of parsed values; synthetic fixtures; tests for matched, unmatched, incompatible, incomplete, duplicate, and ambiguous line pairs; localized copy in all app locales.

**Out of scope:** price ranking or “expensive/cheap/fair” labels; market-price claims; collecting or pooling user budgets; consent and retention changes; OCR/PDF extraction changes; external services; provider or dependency additions; schema migrations unless a demonstrated implementation need is separately approved; changes to the energy score or cost estimate engine.

## 4. Current implementation baseline

- `src/lib/ocr/budget-parser.ts` returns description, quantity, unit, unit price, total, and extraction confidence for parsed lines. Its `BudgetLineItem` type in `src/lib/ingestion/types.ts` has no structured VAT, inclusion, exclusion, or normalized-scope fields.
- `src/lib/budget-review/service.ts:buildBudgetReviewFindings` assigns `NO_REFERENCE` to every parsed line and contains no price thresholds.
- `src/lib/budget-review/advanced-analysis.ts:buildAdvancedFindings` distinguishes incomplete totals and missing quantity/price from lines with no comparable reference. Category omissions and questions are static prompts, not evidence that a work item is included or excluded.
- `src/lib/budget-review/advanced-analysis.ts:buildBudgetAdvancedAnalysis` can receive knowledge-base price references, but those results do not by themselves establish line-level equivalence or a validated price benchmark.
- Existing tests: `tests/budget-review.test.ts`, `tests/budget-review-advanced.test.ts`, `tests/budget-extraction-localization.test.ts`, and `tests/budget-ingestion.test.ts`.
- ES-1.2 implementation: `src/app/api/budget-review/compare/route.ts` parses two text inputs in memory and calls `src/lib/budget-review/comparison.ts`; `src/components/monetization/BudgetComparison.tsx` presents the transient comparison in all seven locales. The existing single-budget analysis/payment flow remains separate.
- Current dimension evidence is limited: category uses the existing text classifier, while exact description pairing means matching descriptions generally yield the same inferred category. Scope and VAT always remain `UNKNOWN`; this v1 does not extract either field.

## 5. Functional requirements (proposed)

1. **Two explicit inputs.** The UI and API require a non-empty text budget on both sides; no missing offer or market benchmark is synthesized.
2. **Deterministic pairing.** Pair rows only when descriptions match after Unicode normalization, case folding, punctuation removal, and whitespace collapse. Duplicate descriptions pair in input order. Similar wording alone never pairs.
3. **Dimension-level result.** Each pair reports category, unit, quantity, scope, and VAT as `MATCH`, `MISMATCH`, or `UNKNOWN`, with stable reason codes. Scope and VAT are `UNKNOWN` in v1 because the parser does not extract structured data for them.
4. **Conservative structure status.** Any mismatch produces `MISMATCH`; otherwise any unknown produces `UNKNOWN`; only all matches produce `MATCH`. A structural match is not a professional equivalence claim.
5. **Closed unit aliases only.** Equivalent spellings in the explicit alias map normalize to one unit. Unsupported or missing units remain `UNKNOWN` or `MISMATCH`; no conversions are performed.
6. **No price verdict or delta.** Display parsed quantities and amounts side by side as reported. Do not subtract totals, rank offers, label one higher/lower/better, or infer VAT-adjusted prices. Per-line price status remains `NO_REFERENCE`.
7. **Scope transparency.** Descriptions and category labels do not prove equal inclusions/exclusions. Without structured scope fields both sides remain `UNKNOWN`.
8. **Transient processing.** Do not write inputs, parsed line items, or comparison output to Neon, Blob, analytics, or logs. No schema migration.
9. **Localized explanation.** UI explains matches, differences, and unknown dimensions in ES, CA, EN, DE, FR, IT, and PT; no internal codes or claims of professional validation.
10. **No behavior outside scope.** Existing single-budget review and payment routes remain unchanged.

## 6. Proposed acceptance criteria

- Synthetic fixtures cover exact matches, duplicate descriptions, explicit unit/category mismatches, missing quantity/unit, unmatched rows, and ambiguous descriptions.
- Tests assert dimension-level results and that unknown/incompatible lines are never called structurally matching.
- Tests prove no numerical price verdict or price delta is emitted and `NO_REFERENCE` remains the only price status.
- No unsupported conversion, hidden default, database/storage write, analytics call, log of input data, external provider, or new dependency is introduced.
- User-facing explanations cover all seven locales and fall back safely for unknown locale values.
- Tests verify that sentinel descriptions, amounts, filenames, and synthetic personal details do not appear in server logs.
- Existing extraction tests remain unchanged in meaning; ES-1.1 evidence is not treated as a comparability accuracy result.
- Evidence records fixture hashes, denominators, commands, and final code SHA. Toni decides product acceptance.

## 7. Risks and controls

| Risk | Control |
| --- | --- |
| Different work hidden behind similar descriptions | Descriptions do not establish scope match; require structured attributes or return `UNKNOWN`. |
| Unit alias mistakes produce false equivalence | Closed alias map with tests; no dimensional conversion by inference. |
| VAT uncertainty distorts totals | Preserve unknown state and abstain from tax-normalized comparison. |
| User mistakes a compatibility result for a price judgment | Separate comparability status from price status; retain `NO_REFERENCE` absent an approved reference set. |
| Knowledge-base records lack enough provenance | Do not treat them as validated benchmarks solely because they were returned by search. |
| Scope grows into collecting user data or external services | ES-1.2.R and provider additions remain separate approval gates. |

## 8. Decisions recorded for v1

1. **Comparison workflow:** two user-provided budgets in the same session (confirmed by Toni).
2. **Comparison dimensions:** compare extracted category, canonical unit, and quantity; show scope and VAT as unknown when not explicitly available. Unknown never counts as a match.
3. **Unit handling:** fixed aliases only; no dimensional or quantity conversion.
4. **Scope:** no v1 scope catalog. Exact description matching is only a pairing aid, not evidence of equal work.
5. **VAT and prices:** do not infer or normalize VAT; do not calculate amount differences or issue price judgments. Keep `NO_REFERENCE`.
6. **Reference dataset:** ES-1.2.R remains separate; no reference data is consumed by ES-1.2.
7. **Persistence:** transient processing only; no database/schema or Blob change.

## 9. Definition of ready / done

**Ready:** Toni confirmed the two-budget workflow. The conservative v1 defaults above govern the remaining dimensions.

**Done:** implementation and synthetic tests are present; privacy, logging, schema, and rollback impacts are recorded; required gates pass; checklist and execution evidence are updated. Toni acceptance remains pending. No pilot with users is required for internal implementation acceptance.
