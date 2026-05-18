export type SupplyType = 'electricity' | 'gas' | 'unknown';

export interface ParsedBillData {
  supplyType: SupplyType;
  amountEur?: number;
  consumptionKwh?: number;
  consumptionM3?: number;
  billingDays?: number;
  periodFrom?: string; // YYYY-MM-DD
  periodTo?: string;   // YYYY-MM-DD
  distributorName?: string;
  zipCode?: string;
  contractPowerKw?: number;
  confidence: 'high' | 'medium' | 'low';
  missingFields: string[];
}

// ─── Supply type detection ───────────────────────────────────────────────────

const ELECTRICITY_SIGNALS = [
  /kWh/i,
  /potencia\s+contratada/i,
  /electricidad/i,
  /suministro\s+el[eé]ctrico/i,
  /CUPS\s+el[eé]ctrico/i,
  /peaje/i,
  /t[eé]rmino\s+de\s+potencia/i,
];

const GAS_SIGNALS = [
  /m[³3]/i,
  /gas\s+natural/i,
  /CUPS\s+de\s+gas/i,
  /t[eé]rmino\s+fijo/i,
  /t[eé]rmino\s+variable\s+de\s+gas/i,
  /poder\s+calor[ií]fico/i,
];

function detectSupplyType(text: string): SupplyType {
  const elecScore = ELECTRICITY_SIGNALS.filter((p) => p.test(text)).length;
  const gasScore = GAS_SIGNALS.filter((p) => p.test(text)).length;
  if (elecScore > 0 && gasScore > 0) {
    return elecScore >= gasScore ? 'electricity' : 'gas';
  }
  if (elecScore > 0) return 'electricity';
  if (gasScore > 0) return 'gas';
  return 'unknown';
}

// ─── Distributor detection ───────────────────────────────────────────────────

const DISTRIBUTOR_PATTERNS: Array<[RegExp, string]> = [
  [/endesa|e-distribuci[oó]n/i, 'Endesa'],
  [/iberdrola/i, 'Iberdrola'],
  [/naturgy|gas\s+natural\s+fenosa/i, 'Naturgy'],
  [/edf|luminus/i, 'EDF'],
  [/repsol/i, 'Repsol'],
  [/totalenergies|total\s+energies/i, 'TotalEnergies'],
  [/holaluz/i, 'Holaluz'],
  [/octopus/i, 'Octopus Energy'],
  [/factor\s+energ[ií]a/i, 'Factor Energía'],
  [/\bedp\b/i, 'EDP'],
  [/cepsa/i, 'Cepsa'],
];

function detectDistributor(text: string): string | undefined {
  for (const [pattern, name] of DISTRIBUTOR_PATTERNS) {
    if (pattern.test(text)) return name;
  }
  return undefined;
}

// ─── European number parsing ─────────────────────────────────────────────────

/**
 * Parse European-formatted number: dots as thousands separators, comma as decimal.
 * Examples: "1.234,56" → 1234.56 | "234,56" → 234.56 | "1234.56" → 1234.56
 */
function parseEuropeanNumber(raw: string): number {
  const trimmed = raw.replace(/\s/g, '');
  // If it has a comma, treat comma as decimal separator (European format)
  if (trimmed.includes(',')) {
    const cleaned = trimmed.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned);
  }
  // Otherwise just parse directly (handles both "1234.56" and "1234")
  return parseFloat(trimmed.replace(/\./g, ''));
}

// ─── Amount extraction ───────────────────────────────────────────────────────

const AMOUNT_PATTERNS = [
  /(?:total\s+a\s+pagar|importe\s+total|total\s+factura|total\s+de\s+la\s+factura|importe\s+de\s+la\s+factura|a\s+pagar)\s*[:\s]*(?:€\s*)?(\d[\d. ]*[,.]?\d{0,2})\s*€?/i,
  /€\s*(\d[\d.]*,\d{2})\b/,
  /(\d[\d.]*,\d{2})\s*€/,
];

function extractAmount(text: string): number | undefined {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = parseEuropeanNumber(match[1].trim());
      if (!isNaN(value) && value > 0) return value;
    }
  }
  return undefined;
}

// ─── Consumption extraction ──────────────────────────────────────────────────

function extractAllNumbers(text: string, pattern: RegExp): number[] {
  const matches: number[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  while ((m = re.exec(text)) !== null) {
    const value = parseEuropeanNumber(m[1].trim());
    if (!isNaN(value) && value > 0) matches.push(value);
  }
  return matches;
}

function extractConsumptionKwh(text: string): number | undefined {
  const matches = extractAllNumbers(text, /(\d[\d.,]*)\s*kWh/i);
  return matches.length > 0 ? Math.max(...matches) : undefined;
}

function extractConsumptionM3(text: string): number | undefined {
  const matches = extractAllNumbers(text, /(\d[\d.,]*)\s*m[³3]/i);
  return matches.length > 0 ? Math.max(...matches) : undefined;
}

// ─── Contract power ──────────────────────────────────────────────────────────

function extractContractPowerKw(text: string): number | undefined {
  const match = text.match(/potencia\s+contratada[:\s]*(\d[\d.,]*)\s*kW/i);
  if (match?.[1]) {
    const value = parseEuropeanNumber(match[1]);
    if (!isNaN(value) && value > 0) return value;
  }
  return undefined;
}

// ─── Date parsing ────────────────────────────────────────────────────────────

/**
 * Parse DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD. Returns undefined if invalid.
 */
function parseDMY(day: string, month: string, year: string): string | undefined {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1990 || y > 2030) return undefined;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function diffInDays(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

interface PeriodResult {
  periodFrom: string;
  periodTo: string;
  billingDays: number;
}

function extractPeriod(text: string): PeriodResult | undefined {
  // Match DD/MM/YYYY or DD-MM-YYYY dates
  const dateRe = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;

  // Try contextual pair patterns first
  const pairPatterns = [
    /(?:del|desde|periodo)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(?:al|hasta|a)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i,
    /(?:from)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(?:to)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i,
  ];

  for (const pattern of pairPatterns) {
    const m = text.match(pattern);
    if (m) {
      const from = parseDMY(m[1], m[2], m[3]);
      const to = parseDMY(m[4], m[5], m[6]);
      if (from && to) {
        const days = diffInDays(from, to);
        if (days > 0 && days < 400) return { periodFrom: from, periodTo: to, billingDays: days };
      }
    }
  }

  // Fallback: collect all dates and take the first two
  const dates: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = dateRe.exec(text)) !== null) {
    const parsed = parseDMY(m[1], m[2], m[3]);
    if (parsed && !dates.includes(parsed)) dates.push(parsed);
    if (dates.length >= 4) break;
  }

  if (dates.length >= 2) {
    const sorted = [...dates].sort();
    const from = sorted[0];
    const to = sorted[sorted.length - 1];
    const days = diffInDays(from, to);
    if (days > 5 && days < 400) return { periodFrom: from, periodTo: to, billingDays: days };
  }

  return undefined;
}

// ─── ZIP code extraction ─────────────────────────────────────────────────────

function extractZipCode(text: string): string | undefined {
  // Spanish postal codes: 5 digits starting 01-49
  const re = /\b([0-4]\d{4})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const code = m[1];
    const first2 = parseInt(code.substring(0, 2), 10);
    // Valid mainland + island range: 01-52 (some Canaries are 35-38, Ceuta/Melilla 51-52)
    if (first2 >= 1 && first2 <= 52) return code;
  }
  return undefined;
}

// ─── Main parser ─────────────────────────────────────────────────────────────

export function parseUtilityBillText(text: string): ParsedBillData {
  const supplyType = detectSupplyType(text);
  const amountEur = extractAmount(text);
  const distributorName = detectDistributor(text);
  const zipCode = extractZipCode(text);
  const contractPowerKw = supplyType === 'electricity' ? extractContractPowerKw(text) : undefined;

  let consumptionKwh: number | undefined;
  let consumptionM3: number | undefined;

  if (supplyType === 'electricity') {
    consumptionKwh = extractConsumptionKwh(text);
  } else if (supplyType === 'gas') {
    consumptionM3 = extractConsumptionM3(text);
  } else {
    // Unknown: try both
    consumptionKwh = extractConsumptionKwh(text);
    consumptionM3 = extractConsumptionM3(text);
  }

  const periodResult = extractPeriod(text);
  const billingDays = periodResult?.billingDays;
  const periodFrom = periodResult?.periodFrom;
  const periodTo = periodResult?.periodTo;

  // Build missing fields list
  const missingFields: string[] = [];
  if (amountEur === undefined) missingFields.push('amountEur');
  const hasConsumption = consumptionKwh !== undefined || consumptionM3 !== undefined;
  if (!hasConsumption) missingFields.push('consumption');
  if (!periodFrom) missingFields.push('period');

  // Confidence
  let confidence: 'high' | 'medium' | 'low';
  if (amountEur !== undefined && hasConsumption && periodFrom) {
    confidence = 'high';
  } else if (amountEur !== undefined && (hasConsumption || periodFrom)) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    supplyType,
    amountEur,
    consumptionKwh,
    consumptionM3,
    billingDays,
    periodFrom,
    periodTo,
    distributorName,
    zipCode,
    contractPowerKw,
    confidence,
    missingFields,
  };
}
