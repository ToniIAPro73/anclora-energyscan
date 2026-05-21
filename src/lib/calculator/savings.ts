import { z } from 'zod';

export const HEATING_SYSTEMS = [
  'gas_boiler',
  'electric_resistance',
  'splits',
  'heat_pump',
  'oil_boiler',
  'pellets',
  'district',
  'unknown',
] as const;

export const savingsCalculatorSchema = z.object({
  propertyType: z.enum(['flat', 'house', 'terraced']).default('flat'),
  area: z.coerce.number().min(20).max(600),
  currentLetter: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']),
  measure: z.enum(['windows', 'insulation', 'heat_pump', 'pv', 'deep_retrofit']),
  monthlySpend: z.coerce.number().min(20).max(2000),
  city: z.string().trim().max(80).optional(),
  // Optional enrichment fields
  constructionYear: z.coerce.number().min(1900).max(2026).optional(),
  occupants: z.coerce.number().int().min(1).max(20).optional(),
  zipCode: z.string().trim().max(10).optional(),
  heatingSystem: z.enum(HEATING_SYSTEMS).optional(),
});

export type SavingsCalculatorInput = z.infer<typeof savingsCalculatorSchema>;

const savingsRateByMeasure: Record<SavingsCalculatorInput['measure'], [number, number]> = {
  windows: [0.06, 0.14],
  insulation: [0.12, 0.28],
  heat_pump: [0.15, 0.35],
  pv: [0.18, 0.45],
  deep_retrofit: [0.28, 0.55],
};

const costByMeasurePerM2: Record<SavingsCalculatorInput['measure'], [number, number]> = {
  windows: [120, 260],
  insulation: [80, 180],
  heat_pump: [90, 190],
  pv: [75, 180],
  deep_retrofit: [300, 700],
};

function constructionYearMultiplier(year: number | undefined): number {
  if (year === undefined) return 1.0;
  if (year < 1960) return 1.35;
  if (year < 1980) return 1.20;
  if (year < 2000) return 1.00;
  if (year < 2010) return 0.85;
  return 0.70;
}

function heatingSystemMultiplierForMeasure(
  measure: SavingsCalculatorInput['measure'],
  heatingSystem: SavingsCalculatorInput['heatingSystem'],
): number {
  if (measure !== 'heat_pump' || heatingSystem === undefined) return 1.0;
  switch (heatingSystem) {
    case 'electric_resistance': return 1.50;
    case 'gas_boiler':
    case 'oil_boiler': return 1.20;
    // Splits are air-to-air heat pumps: some savings vs replacing with aerotermia, but less than a boiler swap
    case 'splits': return 0.55;
    case 'heat_pump': return 0.20;
    default: return 1.00;
  }
}

export function calculateSavingsRange(input: SavingsCalculatorInput) {
  const parsed = savingsCalculatorSchema.parse(input);

  const cyMult = constructionYearMultiplier(parsed.constructionYear);
  const hsMult = heatingSystemMultiplierForMeasure(parsed.measure, parsed.heatingSystem);
  const combinedMult = cyMult * hsMult;

  const [baseMinRate, baseMaxRate] = savingsRateByMeasure[parsed.measure];
  const minRate = Math.min(baseMinRate * combinedMult, 0.90);
  const maxRate = Math.min(baseMaxRate * combinedMult, 0.90);

  const annualSpend = parsed.monthlySpend * 12;
  const minAnnualSavings = Math.round(annualSpend * minRate);
  const maxAnnualSavings = Math.round(annualSpend * maxRate);
  const [minCostM2, maxCostM2] = costByMeasurePerM2[parsed.measure];
  const minCost = Math.round(parsed.area * minCostM2);
  const maxCost = Math.round(parsed.area * maxCostM2);
  const minPaybackYears = maxAnnualSavings > 0 ? Math.round((minCost / maxAnnualSavings) * 10) / 10 : null;
  const maxPaybackYears = minAnnualSavings > 0 ? Math.round((maxCost / minAnnualSavings) * 10) / 10 : null;

  // Input quality
  const optionalCount = [parsed.constructionYear, parsed.heatingSystem, parsed.zipCode, parsed.occupants].filter(
    (v) => v !== undefined,
  ).length;
  let inputQuality: 'basic' | 'enhanced' | 'full';
  if (optionalCount === 0) {
    inputQuality = 'basic';
  } else if (optionalCount <= 2) {
    inputQuality = 'enhanced';
  } else {
    inputQuality = 'full';
  }

  // Narrowing percentage (vs basic): how much smaller the range span is relative to basic
  const basicMinRate = baseMinRate;
  const basicMaxRate = baseMaxRate;
  const basicSpan = (basicMaxRate - basicMinRate) * annualSpend;
  const enhancedSpan = (maxRate - minRate) * annualSpend;
  const savingsNarrowingPct =
    basicSpan > 0 ? Math.round(((basicSpan - enhancedSpan) / basicSpan) * 100) : 0;

  return {
    input: parsed,
    annualSavingsRange: [minAnnualSavings, maxAnnualSavings] as const,
    costRange: [minCost, maxCost] as const,
    paybackYearsRange: [minPaybackYears, maxPaybackYears] as const,
    disclaimer: 'Rango orientativo no garantizado. Requiere validacion tecnica y datos completos de la vivienda.',
    inputQuality,
    savingsNarrowingPct,
  };
}
