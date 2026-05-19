// Patterns that would make the output too assertive — Hermes must use hedged language only
const FORBIDDEN_PATTERNS = [
  /no tiene aislamiento/i,
  /no hay aislamiento/i,
  /está mal aislad/i,
  /la vivienda no tiene/i,
  /ahorrará/i,
  /ahorrará .* €/i,
  /reducción del .* %/i,
  /definitivamente/i,
  /sin duda/i,
  /clearly/i,
  /definitely/i,
  /will save/i,
  /has no insulation/i,
  /eindeutig/i,
  /garantiert/i,
];

// Lexical substitutions: replace overly assertive phrases with hedged equivalents.
// Applied before forbidden-pattern filtering so partial rewrites can still pass.
const HEDGING_SUBSTITUTIONS: Array<[RegExp, string]> = [
  // ES — assertive → hedged
  [/\bconsta de\b/gi,                    'parece estar resuelta con'],
  [/\bestá equipad[ao] con\b/gi,         'podría estar equipad$1 con'],
  [/\bes de doble acristalamiento\b/gi,  'podría corresponder a doble acristalamiento'],
  [/\bson de doble acristalamiento\b/gi, 'podrían corresponder a doble acristalamiento'],
  [/\blo cual es beneficioso\b/gi,       'lo cual puede ser relevante'],
  [/\bes beneficioso para\b/gi,          'puede ser relevante para'],
  [/\bcuenta con\b/gi,                   'parece contar con'],
  [/\bdispone de\b/gi,                   'podría disponer de'],
  [/\bse confirma\b/gi,                  'se aprecia'],
  [/\bse puede afirmar\b/gi,             'se aprecia'],
  [/\bgarantiza\b/gi,                    'puede contribuir a'],
  [/\bmejora(?:rá)? (?:la )?eficiencia\b/gi, 'podría contribuir a la eficiencia'],
  // EN — assertive → hedged
  [/\bconsists of\b/gi,                  'appears to feature'],
  [/\bis equipped with\b/gi,             'may be equipped with'],
  [/\bis double[- ]glazed\b/gi,          'may correspond to double glazing'],
  [/\bwhich is beneficial\b/gi,          'which may be relevant'],
  [/\bconfirms\b/gi,                     'suggests'],
  [/\bguarantees\b/gi,                   'may contribute to'],
  // DE — assertive → hedged
  [/\bbesteht aus\b/gi,                  'scheint zu bestehen aus'],
  [/\bist ausgestattet mit\b/gi,         'könnte ausgestattet sein mit'],
  [/\bist zweifach verglast\b/gi,        'könnte einer Zweifachverglasung entsprechen'],
  [/\bwas vorteilhaft ist\b/gi,          'was relevant sein kann'],
  [/\bgarantiert\b/gi,                   'kann beitragen zu'],
];

export function containsForbiddenContent(text: string): boolean {
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(text));
}

export function sanitizeFinding(finding: string): string {
  let result = finding.trim();
  for (const [pattern, replacement] of HEDGING_SUBSTITUTIONS) {
    result = result.replace(pattern, replacement);
  }
  // Discard the finding entirely if it still contains forbidden assertive claims
  if (containsForbiddenContent(result)) return '';
  return result;
}

export function deduplicateFindings(findings: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const f of findings) {
    const normalized = f.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(f);
  }
  return result;
}
