# Plan v1 — ES-1.2 budget comparability

1. Resolve the product decisions in the feature spec before implementation; preserve the boundary between dimensional comparability and price references.
2. Audit the current Budget Review payload, persisted line-item format, and any second-offer workflow. Confirm whether results can be derived without a schema change.
3. Define a typed, deterministic comparison model with explicit dimension states and stable reason codes. Start with exact canonical values and the approved alias list; do not add inferred conversions.
4. Add synthetic, versioned fixtures for matched, mismatched, missing, unknown, and ambiguous scope/unit/VAT cases. Record fixture hashes and field-level denominators.
5. Add focused tests before implementation for decision rules, abstention, legacy review rendering, localization, and sentinel-safe logging.
6. Implement the comparison model and only the accepted UI/API integration points. Keep `NO_REFERENCE` for price status unless an approved reference data source is explicitly in scope.
7. Evaluate persistence and migration needs. Prefer derived results; if a schema migration is necessary, document the evidence, rollback, and full migration gates before applying it.
8. Run targeted checks while developing, then the repository's final gates in sequence according to the current verification policy; complete the validation checklist and record evidence by SHA.

No real budgets, external providers, paid services, or new dependencies are part of the plan. Do not connect a new data source without Toni's explicit approval and a prior comparison.
