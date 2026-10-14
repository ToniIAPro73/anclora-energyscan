import fixtures from './fixtures/energyscan/es-1.1/budget-fixtures.json';
import { parseBudgetLineItems } from '@/lib/ocr/budget-parser';
import { classifyBudgetText } from '@/lib/ingestion/budget-classifier';
import { getBudgetCategoryLabel } from '@/lib/ingestion/budget-category-localization';
import type { BudgetLineItem, BudgetMeasureCategory } from '@/lib/ingestion/types';

type ExpectedLine = Partial<BudgetLineItem> & { category: BudgetMeasureCategory };
type BudgetFixture = { id: string; text: string; expected: ExpectedLine[] };
const budgetFixtures = fixtures as BudgetFixture[];

describe('ES-1.1 synthetic budget extraction', () => {
  it.each(budgetFixtures)('$id matches annotated fields and reports exact-match coverage', ({ text, expected }) => {
    const extracted = parseBudgetLineItems(text);
    expect(extracted).toHaveLength(expected.length);

    const fields = ['description', 'quantity', 'unit', 'unitPrice', 'total', 'category'] as const;
    const coverage = Object.fromEntries(fields.map((field) => [field, { matches: 0, applicable: 0 }]));

    expected.forEach((row, index) => {
      const actual = extracted[index];
      for (const field of fields) {
        if (row[field] === undefined) continue;
        coverage[field].applicable += 1;
        const actualValue = field === 'category'
          ? classifyBudgetText(actual.description)[0]
          : actual[field as keyof BudgetLineItem];
        if (actualValue === row[field]) coverage[field].matches += 1;
        expect(actualValue).toBe(row[field]);
      }
    });

    for (const field of fields) {
      expect(coverage[field].matches).toBe(coverage[field].applicable);
    }
  });
});

describe('ES-1.1 budget category localization', () => {
  const labels: Record<string, Record<BudgetMeasureCategory, string>> = {
    es: { ENVELOPE_FACADE: 'Aislamiento de fachada', ENVELOPE_ROOF: 'Aislamiento de cubierta', WINDOWS: 'Ventanas', HEATING_SYSTEM: 'Sistema de calefacción', COOLING_SYSTEM: 'Sistema de refrigeración', DHW_SYSTEM: 'Agua caliente sanitaria', VENTILATION: 'Ventilación', PV: 'Energía fotovoltaica', SOLAR_THERMAL: 'Solar térmica', LIGHTING: 'Iluminación', OTHER_NON_ENERGY: 'Obra no energética', UNKNOWN: 'Sin clasificar' },
    ca: { ENVELOPE_FACADE: 'Aïllament de façana', ENVELOPE_ROOF: 'Aïllament de coberta', WINDOWS: 'Finestres', HEATING_SYSTEM: 'Sistema de calefacció', COOLING_SYSTEM: 'Sistema de refrigeració', DHW_SYSTEM: 'Aigua calenta sanitària', VENTILATION: 'Ventilació', PV: 'Energia fotovoltaica', SOLAR_THERMAL: 'Solar tèrmica', LIGHTING: 'Il·luminació', OTHER_NON_ENERGY: 'Obra no energètica', UNKNOWN: 'Sense classificar' },
    en: { ENVELOPE_FACADE: 'Facade insulation', ENVELOPE_ROOF: 'Roof insulation', WINDOWS: 'Windows', HEATING_SYSTEM: 'Heating system', COOLING_SYSTEM: 'Cooling system', DHW_SYSTEM: 'Domestic hot water', VENTILATION: 'Ventilation', PV: 'Photovoltaic', SOLAR_THERMAL: 'Solar thermal', LIGHTING: 'Lighting', OTHER_NON_ENERGY: 'Non-energy work', UNKNOWN: 'Unclassified' },
    de: { ENVELOPE_FACADE: 'Fassadendämmung', ENVELOPE_ROOF: 'Dachdämmung', WINDOWS: 'Fenster', HEATING_SYSTEM: 'Heizsystem', COOLING_SYSTEM: 'Kühlsystem', DHW_SYSTEM: 'Warmwasser', VENTILATION: 'Lüftung', PV: 'Photovoltaik', SOLAR_THERMAL: 'Solarthermie', LIGHTING: 'Beleuchtung', OTHER_NON_ENERGY: 'Nichtenergetische Arbeiten', UNKNOWN: 'Nicht klassifiziert' },
    fr: { ENVELOPE_FACADE: 'Isolation de façade', ENVELOPE_ROOF: 'Isolation de toiture', WINDOWS: 'Fenêtres', HEATING_SYSTEM: 'Système de chauffage', COOLING_SYSTEM: 'Système de refroidissement', DHW_SYSTEM: 'Eau chaude sanitaire', VENTILATION: 'Ventilation', PV: 'Photovoltaïque', SOLAR_THERMAL: 'Solaire thermique', LIGHTING: 'Éclairage', OTHER_NON_ENERGY: 'Travaux non énergétiques', UNKNOWN: 'Non classé' },
    it: { ENVELOPE_FACADE: 'Isolamento della facciata', ENVELOPE_ROOF: 'Isolamento del tetto', WINDOWS: 'Finestre', HEATING_SYSTEM: 'Sistema di riscaldamento', COOLING_SYSTEM: 'Sistema di raffrescamento', DHW_SYSTEM: 'Acqua calda sanitaria', VENTILATION: 'Ventilazione', PV: 'Fotovoltaico', SOLAR_THERMAL: 'Solare termico', LIGHTING: 'Illuminazione', OTHER_NON_ENERGY: 'Lavori non energetici', UNKNOWN: 'Non classificato' },
    pt: { ENVELOPE_FACADE: 'Isolamento de fachada', ENVELOPE_ROOF: 'Isolamento de cobertura', WINDOWS: 'Janelas', HEATING_SYSTEM: 'Sistema de aquecimento', COOLING_SYSTEM: 'Sistema de arrefecimento', DHW_SYSTEM: 'Água quente sanitária', VENTILATION: 'Ventilação', PV: 'Fotovoltaico', SOLAR_THERMAL: 'Solar térmico', LIGHTING: 'Iluminação', OTHER_NON_ENERGY: 'Trabalhos não energéticos', UNKNOWN: 'Não classificado' },
  };

  it.each(Object.entries(labels))('returns translated labels for %s', (locale, expected) => {
    for (const [category, label] of Object.entries(expected)) {
      expect(getBudgetCategoryLabel(category, locale)).toBe(label);
      expect(label).not.toContain(category);
    }
  });

  it('returns safe localized fallback for an unknown runtime category', () => {
    expect(getBudgetCategoryLabel('UNRECOGNIZED', 'es')).toBe('Sin clasificar');
    expect(getBudgetCategoryLabel('toString', 'es')).toBe('Sin clasificar');
    expect(getBudgetCategoryLabel('WINDOWS', 'unknown-locale')).toBe('Windows');
  });
});
