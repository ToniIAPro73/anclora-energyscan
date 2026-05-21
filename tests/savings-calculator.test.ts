import { calculateSavingsRange, getDecisionPotential, savingsCalculatorSchema } from '@/lib/calculator/savings';

describe('savings calculator value clarity', () => {
  it('returns indicative ranges and a non-guaranteed disclaimer', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 80,
      currentLetter: 'E',
      measure: 'insulation',
      monthlySpend: 150,
    });

    expect(result.annualSavingsRange[0]).toBeLessThan(result.annualSavingsRange[1]);
    expect(result.costRange[0]).toBeLessThan(result.costRange[1]);
    expect(result.disclaimer).toContain('no garantizado');
  });

  it('derives annual spend from monthly spend', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 70,
      currentLetter: 'D',
      measure: 'windows',
      monthlySpend: 123,
    });

    expect(result.annualSpend).toBe(1476);
  });

  it('returns the applied savings rate range', () => {
    const result = calculateSavingsRange({
      propertyType: 'house',
      area: 120,
      currentLetter: 'F',
      measure: 'pv',
      monthlySpend: 220,
    });

    expect(result.estimatedSavingsRateRange[0]).toBeGreaterThan(0);
    expect(result.estimatedSavingsRateRange[1]).toBeGreaterThan(result.estimatedSavingsRateRange[0]);
  });

  it('categorizes payback using the prudent midpoint of the range', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 45,
      currentLetter: 'E',
      measure: 'deep_retrofit',
      monthlySpend: 66,
    });

    expect(result.paybackYearsRange[0]).toBeGreaterThan(30);
    expect(result.paybackCategory).toBe('not_economic');
    expect(result.viability).toBe('strategic_not_financial');
  });

  it('categorizes payback above 30 years as very long when still under 60 years midpoint', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 40,
      currentLetter: 'E',
      measure: 'windows',
      monthlySpend: 180,
    });

    expect(result.paybackCategory).toBe('very_long');
  });

  it('explains very long payback instead of presenting it as a raw number only', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 45,
      currentLetter: 'E',
      measure: 'deep_retrofit',
      monthlySpend: 66,
    });

    expect(result.paybackCategory).toMatch(/very_long|not_economic/);
    expect(result.warnings).toContain('very_long_payback');
  });

  it('warns for low monthly spend and deep retrofit', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 45,
      currentLetter: 'E',
      measure: 'deep_retrofit',
      monthlySpend: 66,
    });

    expect(result.warnings).toContain('low_spend_deep_retrofit');
  });

  it('warns when simulating heat pump over an existing heat pump', () => {
    const result = calculateSavingsRange({
      propertyType: 'house',
      area: 120,
      currentLetter: 'C',
      measure: 'heat_pump',
      monthlySpend: 180,
      heatingSystem: 'heat_pump',
    });

    expect(result.warnings).toContain('heat_pump_already_installed');
  });

  it('does not present basic input quality as a guarantee', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 80,
      currentLetter: 'E',
      measure: 'insulation',
      monthlySpend: 150,
    });

    expect(result.inputQuality).toBe('basic');
    expect(result.warnings).toContain('basic_input_quality');
    expect(result.disclaimer).toContain('no garantizado');
  });

  it('keeps Zod validation intact', () => {
    expect(savingsCalculatorSchema.safeParse({
      propertyType: 'flat',
      area: 1,
      currentLetter: 'E',
      measure: 'windows',
      monthlySpend: 120,
    }).success).toBe(false);
  });

  it('includes assumptions used by the result explanation', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 80,
      currentLetter: 'E',
      measure: 'insulation',
      monthlySpend: 150,
    });

    expect(result.assumptions).toEqual(expect.arrayContaining([
      'monthly_spend',
      'measure',
      'area',
      'savings_rate',
      'cost_rate',
    ]));
    expect(result.assumptionValues.annualSpend).toBe(1800);
  });

  it('maps short maximum payback to favorable decision potential', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 20,
      currentLetter: 'E',
      measure: 'windows',
      monthlySpend: 500,
    });

    expect(result.paybackYearsRange[1]).toBeLessThanOrEqual(15);
    expect(result.decisionPotential.level).toBe('favorable');
  });

  it('maps mixed payback range to review decision potential', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 40,
      currentLetter: 'E',
      measure: 'windows',
      monthlySpend: 180,
    });

    expect(result.paybackYearsRange[0]).toBeLessThanOrEqual(30);
    expect(result.paybackYearsRange[1]).toBeGreaterThan(15);
    expect(result.decisionPotential.level).toBe('review');
  });

  it('maps high minimum payback to full analysis decision potential', () => {
    const result = calculateSavingsRange({
      propertyType: 'flat',
      area: 45,
      currentLetter: 'E',
      measure: 'deep_retrofit',
      monthlySpend: 66,
    });

    expect(result.paybackYearsRange[0]).toBeGreaterThan(30);
    expect(result.decisionPotential.level).toBe('full_analysis');
  });

  it('maps missing payback data to not enough data', () => {
    expect(getDecisionPotential([null, null]).level).toBe('not_enough_data');
    expect(getDecisionPotential([4, 12], false).level).toBe('not_enough_data');
  });

  it('keeps simple payback available as internal technical data', () => {
    const result = calculateSavingsRange({
      propertyType: 'house',
      area: 120,
      currentLetter: 'E',
      measure: 'pv',
      monthlySpend: 220,
    });

    expect(result.paybackYearsRange[0]).toEqual(expect.any(Number));
    expect(result.paybackYearsRange[1]).toEqual(expect.any(Number));
  });
});
