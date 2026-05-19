/**
 * Feasibility engine: determines whether a user's stated target letter
 * is achievable given their property data, budget signals, and the
 * improvement scenarios the cost engine can actually price.
 *
 * Only meaningful when objective === 'target_letter'.
 * Uses every available data signal: current letter, score delta per
 * scenario, priced cost estimates, uploaded rehab budgets, and the
 * rough budget range selector.
 */

import type { EnergyLetter, PropertyDataV2, ScoreResultV2, BudgetRange } from '../domain/energy-assessment';
import type { ScenarioCostEstimate } from '../costs/types';
import type { ImprovementScenario } from '../domain/energy-assessment';

export type FeasibilityVerdict =
  | 'feasible'          // ≥1 scenario reaches target within budget signals
  | 'feasible_costly'   // target is reachable but costs exceed stated budget
  | 'infeasible_gap'    // even best scenario cannot close the letter gap
  | 'unknown';          // not enough data to conclude

export interface FeasibilityScenarioResult {
  scenarioId: string;
  scenarioTitle: string;
  reachesTarget: boolean;
  projectedLetter: EnergyLetter;
  minCost: number | null;
  maxCost: number | null;
}

export interface FeasibilityResult {
  verdict: FeasibilityVerdict;
  targetLetter: EnergyLetter;
  currentLetter: EnergyLetter;
  /** Best reachable letter across all scenarios, ignoring budget */
  bestReachableLetter: EnergyLetter;
  /** Minimum cost to reach target (from the cheapest qualifying scenario), null if none reaches it */
  minCostToReachTarget: number | null;
  /** Max cost to reach target (from the cheapest qualifying scenario's upper bound), null if none */
  maxCostToReachTarget: number | null;
  /** Effective budget ceiling used in evaluation, null if unknown */
  effectiveBudgetCeiling: number | null;
  scenarios: FeasibilityScenarioResult[];
}

// Letter ordering: A=0, B=1, …, G=6
const LETTER_ORDER: EnergyLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const LETTER_SCORE_CEILING: Record<EnergyLetter, number> = {
  A: 15, B: 30, C: 45, D: 60, E: 75, F: 90, G: 100,
};

// Rough budget ceilings for each BudgetRange selector value
const BUDGET_RANGE_CEILING: Record<BudgetRange, number | null> = {
  low: 3_000,
  medium: 10_000,
  high: null,     // high = no practical upper limit we enforce
  unknown: null,  // unknown = no constraint from selector
};

function projectedLetter(currentScore: number, scoreDelta: number): EnergyLetter {
  const projected = Math.max(0, Math.min(100, currentScore - (scoreDelta ?? 0)));
  if (projected <= 15) return 'A';
  if (projected <= 30) return 'B';
  if (projected <= 45) return 'C';
  if (projected <= 60) return 'D';
  if (projected <= 75) return 'E';
  if (projected <= 90) return 'F';
  return 'G';
}

function letterIndex(l: EnergyLetter): number {
  return LETTER_ORDER.indexOf(l);
}

/** True if `achieved` is the same or better (lower index) than `target` */
function meetsOrBetterThan(achieved: EnergyLetter, target: EnergyLetter): boolean {
  return letterIndex(achieved) <= letterIndex(target);
}

/**
 * Derive the effective budget ceiling from all available signals:
 * 1. Uploaded rehab budgets (most precise — use sum of totals)
 * 2. BudgetRange selector
 * Returns null when there is no meaningful upper limit.
 */
function effectiveBudgetCeiling(
  budgetRange: BudgetRange | undefined,
  rehabBudgetTotals: number[],
): number | null {
  // Uploaded real budgets take priority: they represent actual quotes
  if (rehabBudgetTotals.length > 0) {
    const total = rehabBudgetTotals.reduce((s, v) => s + v, 0);
    if (total > 0) return total;
  }
  // Fall back to range selector
  if (budgetRange && budgetRange !== 'unknown') {
    return BUDGET_RANGE_CEILING[budgetRange];
  }
  return null; // no constraint
}

export function computeFeasibility(
  propertyData: PropertyDataV2,
  scoreResult: ScoreResultV2,
  scenarios: ImprovementScenario[],
  costEstimates: Array<ScenarioCostEstimate | null>,
  /** totalAmount values from uploaded RehabBudget rows (may be empty) */
  rehabBudgetTotals: number[],
): FeasibilityResult | null {
  const targetLetter = propertyData.targetLetter as EnergyLetter | undefined;
  if (!targetLetter || propertyData.objective !== 'target_letter') return null;

  const currentLetter = scoreResult.estimatedLetter as EnergyLetter;
  const budgetCeiling = effectiveBudgetCeiling(propertyData.budgetRange, rehabBudgetTotals);

  // Evaluate each scenario
  const scenarioResults: FeasibilityScenarioResult[] = scenarios.map((s, i) => {
    const cost = costEstimates[i] ?? null;
    const pl = projectedLetter(scoreResult.score, s.estimatedScoreDelta ?? 0);
    return {
      scenarioId: s.id,
      scenarioTitle: s.title,
      reachesTarget: meetsOrBetterThan(pl, targetLetter),
      projectedLetter: pl,
      minCost: cost?.minTotal ?? null,
      maxCost: cost?.maxTotal ?? null,
    };
  });

  // Best reachable letter ignoring budget (lowest letter index achieved)
  const bestReachableLetter = scenarioResults.reduce<EnergyLetter>((best, sr) => {
    return letterIndex(sr.projectedLetter) < letterIndex(best) ? sr.projectedLetter : best;
  }, currentLetter);

  // Scenarios that reach the target
  const reachingScenarios = scenarioResults.filter(sr => sr.reachesTarget);

  if (reachingScenarios.length === 0) {
    // Even best scenario can't close the gap
    return {
      verdict: 'infeasible_gap',
      targetLetter,
      currentLetter,
      bestReachableLetter,
      minCostToReachTarget: null,
      maxCostToReachTarget: null,
      effectiveBudgetCeiling: budgetCeiling,
      scenarios: scenarioResults,
    };
  }

  // Among reaching scenarios, find cheapest (by minCost)
  const cheapestReaching = reachingScenarios
    .filter(sr => sr.minCost !== null)
    .sort((a, b) => (a.minCost ?? 0) - (b.minCost ?? 0))[0]
    ?? reachingScenarios[0];

  const minCostToReachTarget = cheapestReaching.minCost;
  const maxCostToReachTarget = cheapestReaching.maxCost;

  // Budget feasibility check
  if (budgetCeiling !== null && minCostToReachTarget !== null) {
    // Feasible only if the minimum cost of cheapest reaching scenario fits the budget
    if (minCostToReachTarget > budgetCeiling) {
      return {
        verdict: 'feasible_costly',
        targetLetter,
        currentLetter,
        bestReachableLetter,
        minCostToReachTarget,
        maxCostToReachTarget,
        effectiveBudgetCeiling: budgetCeiling,
        scenarios: scenarioResults,
      };
    }
  }

  return {
    verdict: 'feasible',
    targetLetter,
    currentLetter,
    bestReachableLetter,
    minCostToReachTarget,
    maxCostToReachTarget,
    effectiveBudgetCeiling: budgetCeiling,
    scenarios: scenarioResults,
  };
}
