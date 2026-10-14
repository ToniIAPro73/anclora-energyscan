import type { BudgetMeasureCategory } from './types';

type BudgetLocale = 'es' | 'ca' | 'en' | 'de' | 'fr' | 'it' | 'pt';

const CATEGORY_LABELS: Record<BudgetLocale, Record<BudgetMeasureCategory, string>> = {
  es: {
    ENVELOPE_FACADE: 'Aislamiento de fachada', ENVELOPE_ROOF: 'Aislamiento de cubierta', WINDOWS: 'Ventanas',
    HEATING_SYSTEM: 'Sistema de calefacción', COOLING_SYSTEM: 'Sistema de refrigeración', DHW_SYSTEM: 'Agua caliente sanitaria',
    VENTILATION: 'Ventilación', PV: 'Energía fotovoltaica', SOLAR_THERMAL: 'Solar térmica', LIGHTING: 'Iluminación',
    OTHER_NON_ENERGY: 'Obra no energética', UNKNOWN: 'Sin clasificar',
  },
  ca: {
    ENVELOPE_FACADE: 'Aïllament de façana', ENVELOPE_ROOF: 'Aïllament de coberta', WINDOWS: 'Finestres',
    HEATING_SYSTEM: 'Sistema de calefacció', COOLING_SYSTEM: 'Sistema de refrigeració', DHW_SYSTEM: 'Aigua calenta sanitària',
    VENTILATION: 'Ventilació', PV: 'Energia fotovoltaica', SOLAR_THERMAL: 'Solar tèrmica', LIGHTING: 'Il·luminació',
    OTHER_NON_ENERGY: 'Obra no energètica', UNKNOWN: 'Sense classificar',
  },
  en: {
    ENVELOPE_FACADE: 'Facade insulation', ENVELOPE_ROOF: 'Roof insulation', WINDOWS: 'Windows',
    HEATING_SYSTEM: 'Heating system', COOLING_SYSTEM: 'Cooling system', DHW_SYSTEM: 'Domestic hot water',
    VENTILATION: 'Ventilation', PV: 'Photovoltaic', SOLAR_THERMAL: 'Solar thermal', LIGHTING: 'Lighting',
    OTHER_NON_ENERGY: 'Non-energy work', UNKNOWN: 'Unclassified',
  },
  de: {
    ENVELOPE_FACADE: 'Fassadendämmung', ENVELOPE_ROOF: 'Dachdämmung', WINDOWS: 'Fenster',
    HEATING_SYSTEM: 'Heizsystem', COOLING_SYSTEM: 'Kühlsystem', DHW_SYSTEM: 'Warmwasser',
    VENTILATION: 'Lüftung', PV: 'Photovoltaik', SOLAR_THERMAL: 'Solarthermie', LIGHTING: 'Beleuchtung',
    OTHER_NON_ENERGY: 'Nichtenergetische Arbeiten', UNKNOWN: 'Nicht klassifiziert',
  },
  fr: {
    ENVELOPE_FACADE: 'Isolation de façade', ENVELOPE_ROOF: 'Isolation de toiture', WINDOWS: 'Fenêtres',
    HEATING_SYSTEM: 'Système de chauffage', COOLING_SYSTEM: 'Système de refroidissement', DHW_SYSTEM: 'Eau chaude sanitaire',
    VENTILATION: 'Ventilation', PV: 'Photovoltaïque', SOLAR_THERMAL: 'Solaire thermique', LIGHTING: 'Éclairage',
    OTHER_NON_ENERGY: 'Travaux non énergétiques', UNKNOWN: 'Non classé',
  },
  it: {
    ENVELOPE_FACADE: 'Isolamento della facciata', ENVELOPE_ROOF: 'Isolamento del tetto', WINDOWS: 'Finestre',
    HEATING_SYSTEM: 'Sistema di riscaldamento', COOLING_SYSTEM: 'Sistema di raffrescamento', DHW_SYSTEM: 'Acqua calda sanitaria',
    VENTILATION: 'Ventilazione', PV: 'Fotovoltaico', SOLAR_THERMAL: 'Solare termico', LIGHTING: 'Illuminazione',
    OTHER_NON_ENERGY: 'Lavori non energetici', UNKNOWN: 'Non classificato',
  },
  pt: {
    ENVELOPE_FACADE: 'Isolamento de fachada', ENVELOPE_ROOF: 'Isolamento de cobertura', WINDOWS: 'Janelas',
    HEATING_SYSTEM: 'Sistema de aquecimento', COOLING_SYSTEM: 'Sistema de arrefecimento', DHW_SYSTEM: 'Água quente sanitária',
    VENTILATION: 'Ventilação', PV: 'Fotovoltaico', SOLAR_THERMAL: 'Solar térmico', LIGHTING: 'Iluminação',
    OTHER_NON_ENERGY: 'Trabalhos não energéticos', UNKNOWN: 'Não classificado',
  },
};

const UNKNOWN_LABEL: Record<BudgetLocale, string> = {
  es: 'Sin clasificar', ca: 'Sense classificar', en: 'Unclassified', de: 'Nicht klassifiziert',
  fr: 'Non classé', it: 'Non classificato', pt: 'Não classificado',
};

const SUPPORTED_LOCALES = new Set<BudgetLocale>(['es', 'ca', 'en', 'de', 'fr', 'it', 'pt']);

export function getBudgetCategoryLabel(category: string, locale: string): string {
  const safeLocale: BudgetLocale = SUPPORTED_LOCALES.has(locale as BudgetLocale)
    ? locale as BudgetLocale
    : 'en';
  if (!Object.hasOwn(CATEGORY_LABELS[safeLocale], category)) return UNKNOWN_LABEL[safeLocale];
  return CATEGORY_LABELS[safeLocale][category as BudgetMeasureCategory];
}
