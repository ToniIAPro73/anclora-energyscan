export type EnergyDocumentKind = 'budget' | 'certificate' | 'unknown';

export function classifyEnergyDocument(input: { fileName?: string; text?: string; markdown?: string }): EnergyDocumentKind {
  const haystack = `${input.fileName ?? ''}\n${input.text ?? ''}\n${input.markdown ?? ''}`.toLowerCase();

  if (/(certificado|calificaci[oó]n energ[eé]tica|emisiones|energ[ií]a primaria no renovable)/i.test(haystack)) {
    return 'certificate';
  }
  if (/(presupuesto|importe total|base imponible|iva|aerotermia|fotovoltaica|ventanas)/i.test(haystack)) {
    return 'budget';
  }

  return 'unknown';
}
