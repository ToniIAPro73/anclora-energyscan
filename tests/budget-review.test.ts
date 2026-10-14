import { buildBudgetReviewFindings, hashBudgetText } from '@/lib/budget-review/service';
import { parseBudgetAnalysisText } from '@/lib/ocr/budget-parser';

const BUDGET_TEXT = `
Presupuesto reforma energetica
Ventanas PVC 12 m2 520 €/m2 6.240,00 €
Aislamiento fachada SATE 80 m2 95 €/m2 7.600,00 €
TOTAL PRESUPUESTO 13.840,00 €
`;

describe('budget review', () => {
  it('parses amounts from budget text', () => {
    const analysis = parseBudgetAnalysisText(BUDGET_TEXT);
    expect(analysis.totalAmount).toBe(13840);
    expect(analysis.lineItems.length).toBeGreaterThan(0);
  });

  it('does not label prices as high or low and shows no amount-based alert', () => {
    const analysis = parseBudgetAnalysisText(BUDGET_TEXT);
    const findings = buildBudgetReviewFindings(analysis.lineItems);
    expect(findings.findings.length).toBeGreaterThan(0);
    expect(findings.findings.every((finding) => finding.status === 'NO_REFERENCE')).toBe(true);
    expect(findings.alert).not.toMatch(/alto|elevado/i);
    expect(findings.legalNotice).toContain('orientativo');
  });

  it('hashes source text without storing raw text', () => {
    expect(hashBudgetText(BUDGET_TEXT)).toHaveLength(64);
  });
});
