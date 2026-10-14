import { classifyBudgetText } from '@/lib/ingestion/budget-classifier';
import type { BudgetLineItem } from '@/lib/ingestion/types';

export type ComparisonDimension = 'MATCH' | 'MISMATCH' | 'UNKNOWN';

export type BudgetLineComparison = {
  left: BudgetLineItem;
  right: BudgetLineItem;
  category: ComparisonDimension;
  unit: ComparisonDimension;
  quantity: ComparisonDimension;
  scope: 'UNKNOWN';
  vat: 'UNKNOWN';
  structure: ComparisonDimension;
  priceStatus: 'NO_REFERENCE';
};

export type UnmatchedBudgetLine = {
  line: BudgetLineItem;
  reason: 'NO_EXACT_DESCRIPTION_MATCH' | 'AMBIGUOUS_DUPLICATE_DESCRIPTION';
};

export type BudgetComparisonResult = {
  matches: BudgetLineComparison[];
  unmatchedLeft: UnmatchedBudgetLine[];
  unmatchedRight: UnmatchedBudgetLine[];
  priceComparisonAvailable: false;
};

const unitAliases: Record<string, string> = {
  m2: 'm²',
  'm²': 'm²',
  'm^2': 'm²',
  ml: 'ml',
  'm.l': 'ml',
  m: 'm',
  metro: 'm',
  metros: 'm',
  ud: 'ud',
  uds: 'ud',
  und: 'ud',
  unidad: 'ud',
  unidades: 'ud',
  kg: 'kg',
  h: 'h',
  hora: 'h',
  horas: 'h',
  kwp: 'kWp',
  l: 'l',
};

function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizeBudgetUnit(value?: string): string | undefined {
  if (!value) return undefined;
  const key = normalizeText(value).replace(/\s+/g, '');
  return unitAliases[key];
}

function compareCategories(leftDescription: string, rightDescription: string): ComparisonDimension {
  const left = classifyBudgetText(leftDescription).filter((category) => category !== 'UNKNOWN').sort();
  const right = classifyBudgetText(rightDescription).filter((category) => category !== 'UNKNOWN').sort();
  if (left.length === 0 || right.length === 0) return 'UNKNOWN';
  return left.join('|') === right.join('|') ? 'MATCH' : 'MISMATCH';
}

function compareUnit(left?: string, right?: string): ComparisonDimension {
  const normalizedLeft = normalizeBudgetUnit(left);
  const normalizedRight = normalizeBudgetUnit(right);
  if (!normalizedLeft || !normalizedRight) return 'UNKNOWN';
  return normalizedLeft === normalizedRight ? 'MATCH' : 'MISMATCH';
}

function compareQuantity(left?: number, right?: number): ComparisonDimension {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return 'UNKNOWN';
  const scale = Math.max(1, Math.abs(left!), Math.abs(right!));
  return Math.abs(left! - right!) <= scale * 1e-6 ? 'MATCH' : 'MISMATCH';
}

function compareStructure(dimensions: ComparisonDimension[]): ComparisonDimension {
  if (dimensions.includes('MISMATCH')) return 'MISMATCH';
  if (dimensions.includes('UNKNOWN')) return 'UNKNOWN';
  return 'MATCH';
}

/**
 * Aligns budget lines conservatively. Description equality is only a pairing hint;
 * it does not prove scope equality or permit a price judgment.
 */
export function compareBudgetLineItems(
  leftItems: BudgetLineItem[],
  rightItems: BudgetLineItem[],
): BudgetComparisonResult {
  const leftByDescription = new Map<string, number[]>();
  const rightByDescription = new Map<string, number[]>();

  leftItems.forEach((item, index) => {
    const description = normalizeText(item.description);
    if (!description) return;
    leftByDescription.set(description, [...(leftByDescription.get(description) ?? []), index]);
  });
  rightItems.forEach((item, index) => {
    const description = normalizeText(item.description);
    if (!description) return;
    rightByDescription.set(description, [...(rightByDescription.get(description) ?? []), index]);
  });

  const pairedRight = new Set<number>();
  const pairedLeft = new Set<number>();
  const matches: BudgetLineComparison[] = [];
  const ambiguousLeft = new Set<number>();
  const ambiguousRight = new Set<number>();

  leftByDescription.forEach((leftIndexes, description) => {
    const rightIndexes = rightByDescription.get(description) ?? [];
    if (rightIndexes.length === 0 || leftIndexes.length === rightIndexes.length) return;
    leftIndexes.forEach((index) => ambiguousLeft.add(index));
    rightIndexes.forEach((index) => ambiguousRight.add(index));
  });

  Array.from(leftByDescription.entries()).forEach(([description, leftIndexes]) => {
    const rightIndexes = rightByDescription.get(description) ?? [];
    if (rightIndexes.length === 0) return;

    for (const leftIndex of leftIndexes) {
      const available = rightIndexes.filter((index) => !pairedRight.has(index));
      if (available.length === 0) return;

      const leftItem = leftItems[leftIndex];
      // Duplicate descriptions pair by input order; dimensions are reported after pairing.
      const rightIndex = available[0];

      pairedLeft.add(leftIndex);
      pairedRight.add(rightIndex);
      const rightItem = rightItems[rightIndex];
      const category = compareCategories(leftItem.description, rightItem.description);
      const unit = compareUnit(leftItem.unit, rightItem.unit);
      const quantity = compareQuantity(leftItem.quantity, rightItem.quantity);

      matches.push({
        left: leftItem,
        right: rightItem,
        category,
        unit,
        quantity,
        scope: 'UNKNOWN',
        vat: 'UNKNOWN',
        structure: compareStructure([category, unit, quantity]),
        priceStatus: 'NO_REFERENCE',
      });
    }
  });

  const unmatchedLeft = leftItems.flatMap((line, index) => {
    if (pairedLeft.has(index)) return [];
    return [{
      line,
      reason: ambiguousLeft.has(index) ? 'AMBIGUOUS_DUPLICATE_DESCRIPTION' as const : 'NO_EXACT_DESCRIPTION_MATCH' as const,
    }];
  });
  const unmatchedRight = rightItems.flatMap((line, index) => {
    if (pairedRight.has(index)) return [];
    return [{
      line,
      reason: ambiguousRight.has(index) ? 'AMBIGUOUS_DUPLICATE_DESCRIPTION' as const : 'NO_EXACT_DESCRIPTION_MATCH' as const,
    }];
  });

  return { matches, unmatchedLeft, unmatchedRight, priceComparisonAvailable: false };
}
