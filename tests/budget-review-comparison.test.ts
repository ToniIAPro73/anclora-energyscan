import { compareBudgetLineItems, normalizeBudgetUnit } from '@/lib/budget-review/comparison';
import type { BudgetLineItem } from '@/lib/ingestion/types';
import { parseBudgetLineItems } from '@/lib/ocr/budget-parser';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { budgetComparisonCopy, dimension } from '@/components/monetization/BudgetComparison';

const line = (value: Partial<BudgetLineItem> & Pick<BudgetLineItem, 'description'>): BudgetLineItem => value;

describe('budget review comparison', () => {
  it('provides localized comparison status and no-reference copy for every app locale', () => {
    const locales = ['es', 'ca', 'en', 'de', 'fr', 'it', 'pt'] as const;
    for (const locale of locales) {
      expect(budgetComparisonCopy[locale].title).toBeTruthy();
      expect(budgetComparisonCopy[locale].noPrice).toBeTruthy();
      expect(budgetComparisonCopy[locale].disclaimer).toBeTruthy();
      expect(dimension('UNKNOWN', locale)).toBeTruthy();
    }
  });

  it('compares the synthetic budget fixtures without deriving price judgments', () => {
    const leftText = readFileSync(join(process.cwd(), 'tests/fixtures/budget-comparison-a.txt'), 'utf8');
    const rightText = readFileSync(join(process.cwd(), 'tests/fixtures/budget-comparison-b.txt'), 'utf8');
    const result = compareBudgetLineItems(parseBudgetLineItems(leftText), parseBudgetLineItems(rightText));
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.priceComparisonAvailable).toBe(false);
    expect(result.matches.every((item) => item.priceStatus === 'NO_REFERENCE')).toBe(true);
  });

  it('pairs exact normalized descriptions and compares structure without judging prices', () => {
    const result = compareBudgetLineItems(
      [line({ description: 'Ventanas PVC', quantity: 2, unit: 'ud', unitPrice: 900, total: 1800 })],
      [line({ description: ' ventanas   pvc! ', quantity: 2, unit: 'uds.', unitPrice: 1100, total: 2200 })],
    );

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]).toMatchObject({
      category: 'MATCH',
      unit: 'MATCH',
      quantity: 'MATCH',
      scope: 'UNKNOWN',
      vat: 'UNKNOWN',
      structure: 'MATCH',
      priceStatus: 'NO_REFERENCE',
    });
    expect(result.priceComparisonAvailable).toBe(false);
    expect(result.matches[0]).not.toHaveProperty('priceDifference');
  });

  it('reports unit and quantity mismatches for a paired description', () => {
    const result = compareBudgetLineItems(
      [line({ description: 'Aislamiento de fachada', quantity: 40, unit: 'm2', total: 4000 })],
      [line({ description: 'Aislamiento de fachada', quantity: 25, unit: 'ml', total: 2500 })],
    );

    expect(result.matches[0]).toMatchObject({ unit: 'MISMATCH', quantity: 'MISMATCH', structure: 'MISMATCH' });
  });

  it('keeps missing measurement fields unknown', () => {
    const result = compareBudgetLineItems(
      [line({ description: 'Instalación fotovoltaica', total: 3500 })],
      [line({ description: 'Instalación fotovoltaica', unit: 'kWp', total: 3700 })],
    );

    expect(result.matches[0]).toMatchObject({ unit: 'UNKNOWN', quantity: 'UNKNOWN', scope: 'UNKNOWN', vat: 'UNKNOWN', structure: 'UNKNOWN' });
  });

  it('leaves different descriptions unmatched instead of fuzzy pairing', () => {
    const result = compareBudgetLineItems(
      [line({ description: 'Sustitución de ventanas PVC', unit: 'ud' })],
      [line({ description: 'Instalación de carpintería de aluminio', unit: 'ud' })],
    );

    expect(result.matches).toHaveLength(0);
    expect(result.unmatchedLeft).toHaveLength(1);
    expect(result.unmatchedRight).toHaveLength(1);
  });

  it('matches duplicate descriptions in input order', () => {
    const result = compareBudgetLineItems(
      [line({ description: 'Aislamiento', unit: 'm2' }), line({ description: 'Aislamiento', unit: 'ml' })],
      [line({ description: 'Aislamiento', unit: 'ml' }), line({ description: 'Aislamiento', unit: 'm²' })],
    );

    expect(result.matches).toHaveLength(2);
    expect(result.matches.map((match) => [match.left.unit, match.right.unit])).toEqual([['m2', 'ml'], ['ml', 'm²']]);
    expect(result.unmatchedLeft).toHaveLength(0);
    expect(result.unmatchedRight).toHaveLength(0);
  });

  it('marks surplus duplicate descriptions as ambiguous instead of inventing a pair', () => {
    const result = compareBudgetLineItems(
      [line({ description: 'Aislamiento', unit: 'm2' }), line({ description: 'Aislamiento', unit: 'ml' })],
      [line({ description: 'Aislamiento', unit: 'm2' })],
    );

    expect(result.matches).toHaveLength(1);
    expect(result.unmatchedLeft).toHaveLength(1);
    expect(result.unmatchedLeft[0].reason).toBe('AMBIGUOUS_DUPLICATE_DESCRIPTION');
  });

  it('normalizes only the closed alias set and never performs conversions', () => {
    expect(normalizeBudgetUnit('m²')).toBe('m²');
    expect(normalizeBudgetUnit('m2')).toBe('m²');
    expect(normalizeBudgetUnit('uds.')).toBe('ud');
    expect(normalizeBudgetUnit('kWp')).toBe('kWp');
    expect(normalizeBudgetUnit('cm')).toBeUndefined();
  });
});
