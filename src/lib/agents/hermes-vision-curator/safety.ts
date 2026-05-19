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

export function containsForbiddenContent(text: string): boolean {
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(text));
}

export function sanitizeFinding(finding: string): string {
  // Strip forbidden content; if the whole finding is prohibited, return empty string
  if (containsForbiddenContent(finding)) return '';
  return finding.trim();
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
