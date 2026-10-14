# ES-1.2 — Budget comparability and scope normalization

**Status:** Draft for Toni's product review; no application changes implemented.
**Phase:** F1 · **Depends on:** ES-1.1; F0-R09; any price reference source must be separately approved and governed.

## 1. Problem and objective

ES-1.1 extracts and localizes budget line items. Budget Review currently abstains from price judgments and labels each line `NO_REFERENCE`. It can show category-level omissions and questions, but it does not establish that two line items cover the same work, measurement basis, tax treatment, or exclusions.

ES-1.2 will make the basis for a comparison explicit. It must identify missing or conflicting comparison fields and explain when two items cannot be compared. It must not infer that a price is high, low, fair, or a market price from incomplete or incompatible data.

## 2. Proposed product boundary

- Compare line items only when both sides of a comparison are available. The initial implementation must not imply that one uploaded budget is a comparison against other offers or against a market benchmark.
- Treat description/category, unit and quantity basis, included work, exclusions, and VAT treatment as comparison dimensions. Missing or uncertain values remain unknown; they are never silently defaulted.
- Normalize only explicit, deterministic unit aliases. Do not convert dimensions or quantities unless an approved conversion rule and its evidence are recorded.
- Keep price assessment at `NO_REFERENCE` unless an independently approved, provenance-bearing reference set satisfies the comparison dimensions. ES-1.2.R is separate and is not authorized by this spec.
- Keep the workflow local to existing application code and data. No new external provider, paid service, or dependency. Any exception requires Toni's explicit approval and a prior comparison.

These boundaries are proposals for review. The unresolved product choices in §8 must be decided before implementation begins.

## 3. Scope

**In scope:** a deterministic comparability model; explicit match, mismatch, and unknown states for comparison dimensions; user-visible explanations and follow-up questions; synthetic fixtures; tests for compatible, incompatible, incomplete, and ambiguous line pairs; localization in the currently supported languages where affected copy is introduced.

**Out of scope:** price ranking or “expensive/cheap/fair” labels; market-price claims; collecting or pooling user budgets; consent and retention changes; OCR/PDF extraction changes; external services; provider or dependency additions; schema migrations unless a demonstrated implementation need is separately approved; changes to the energy score or cost estimate engine.

## 4. Current implementation baseline

- `src/lib/ocr/budget-parser.ts` returns description, quantity, unit, unit price, total, and extraction confidence for parsed lines. Its `BudgetLineItem` type in `src/lib/ingestion/types.ts` has no structured VAT, inclusion, exclusion, or normalized-scope fields.
- `src/lib/budget-review/service.ts:buildBudgetReviewFindings` assigns `NO_REFERENCE` to every parsed line and contains no price thresholds.
- `src/lib/budget-review/advanced-analysis.ts:buildAdvancedFindings` distinguishes incomplete totals and missing quantity/price from lines with no comparable reference. Category omissions and questions are static prompts, not evidence that a work item is included or excluded.
- `src/lib/budget-review/advanced-analysis.ts:buildBudgetAdvancedAnalysis` can receive knowledge-base price references, but those results do not by themselves establish line-level equivalence or a validated price benchmark.
- Existing tests: `tests/budget-review.test.ts`, `tests/budget-review-advanced.test.ts`, `tests/budget-extraction-localization.test.ts`, and `tests/budget-ingestion.test.ts`.

## 5. Functional requirements (proposed)

1. **Explicit comparison pair.** The comparison API receives two identified line-item records and does not synthesize a missing second offer or benchmark.
2. **Dimension-level result.** For each configured dimension (category/scope, unit basis, quantity, VAT treatment, inclusions, exclusions), return `MATCH`, `MISMATCH`, or `UNKNOWN` plus stable reason codes. No free-form source text is needed in logs.
3. **Conservative compatibility.** A pair is comparable only when all dimensions required by the selected comparison profile match. `UNKNOWN` or `MISMATCH` prevents an overall comparable result.
4. **No implicit unit conversions.** Exact canonical units and explicitly enumerated aliases may match. Unsupported or dimensionally different units produce `UNKNOWN` or `MISMATCH`; no guessed conversion.
5. **VAT transparency.** VAT included/excluded and rate are separate values. Unknown VAT is not inferred from country, date, or total; it prevents a tax-normalized price comparison.
6. **Scope transparency.** Included work and exclusions count as matching only when explicitly represented by structured, reviewed attributes. Category labels and descriptions alone do not prove scope equivalence.
7. **Honest price output.** This phase does not emit a price rating. Without an approved reference set, price status remains `NO_REFERENCE`, regardless of dimensional compatibility.
8. **Localized explanation.** UI explains which comparison dimensions match, differ, or are unknown. It does not expose internal codes or claim professional validation.
9. **Privacy-safe telemetry.** Logs contain only stable reason codes and aggregate counts; no line descriptions, raw document text, provider names, amounts, or filenames.
10. **No behavior outside the accepted scope.** Existing budget review and estimates remain unchanged until Toni accepts this SDD and implementation evidence.

## 6. Proposed acceptance criteria

- Synthetic fixtures cover exact matches, explicit mismatches, unknown VAT, missing quantity/unit, incompatible dimensions, scope differences, exclusions, and ambiguous descriptions.
- Tests assert the dimension-level result and overall decision for every fixture; unknown/incompatible pairs never become comparable.
- Tests prove there is no numerical price verdict and `NO_REFERENCE` is preserved in the absence of an approved reference dataset.
- No unsupported conversion, hidden default, external call, new dependency, or persistent user-budget corpus is introduced.
- User-facing explanations are localized for all enabled locales and have a neutral fallback.
- Tests verify privacy-safe logging with synthetic sentinel descriptions, amounts, names, and filenames.
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

## 8. Decisions required before implementation

1. **Comparison workflow:** should the first release compare two user-provided offers, or only report completeness/differences within one offer? Current Budget Review accepts one budget at a time.
2. **Comparison profile:** which dimensions are mandatory for an overall `COMPARABLE` result, and which should be shown as advisory unknowns?
3. **Unit aliases/conversions:** approve the initial closed alias list; confirm whether any actual conversions are needed in v1. Recommendation: aliases only, no conversion.
4. **VAT:** decide whether a missing VAT rate blocks all price comparisons even when both offers state the same included/excluded status. Recommendation: do not normalize tax-adjusted amounts without a known rate.
5. **Scope catalog:** approve a small versioned set of structured inclusion/exclusion attributes per category, or defer scope matching and show unknown until such a catalog exists.
6. **Reference dataset:** confirm that no price rating is part of ES-1.2 until ES-1.2.R has a separately accepted catalog, privacy design, and implementation. Recommendation: keep every price status `NO_REFERENCE` in this phase.
7. **Persistence:** decide whether comparison results are derived at read time or saved. Recommendation: derive from existing review data first; do not add a migration without a proven need.

## 9. Definition of ready / done

**Ready:** Toni resolves decisions 1, 2, and 5 at minimum; confirms the remaining recommendations or alternatives; and accepts this spec's boundary with ES-1.2.R.

**Done:** all accepted requirements have tests and traceable synthetic evidence; privacy, logging, schema, and rollback impacts are recorded; required gates pass; checklist and execution evidence are updated; Toni accepts the phase. No pilot with users is required for internal implementation acceptance.
