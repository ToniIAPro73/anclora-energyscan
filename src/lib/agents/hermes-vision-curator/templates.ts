import type { HermesLocale } from './types';

// Human-readable labels for image types per locale
const CATEGORY_LABELS: Record<string, Record<HermesLocale, string>> = {
  facade:        { es: 'Fachada y envolvente',    en: 'Facade & building envelope', de: 'Fassade & Gebäudehülle' },
  windows:       { es: 'Carpinterías y acristalamiento', en: 'Windows & glazing',    de: 'Fenster & Verglasung' },
  roof:          { es: 'Cubierta y tejado',        en: 'Roof',                        de: 'Dach' },
  heating:       { es: 'Sistema de calefacción/ACS', en: 'Heating & hot water',     de: 'Heizung & Warmwasser' },
  insulation:    { es: 'Aislamiento térmico',      en: 'Thermal insulation',          de: 'Wärmedämmung' },
  interior:      { es: 'Espacios interiores',      en: 'Interior spaces',             de: 'Innenräume' },
  documentation: { es: 'Documentación aportada',  en: 'Submitted documentation',      de: 'Eingereichte Unterlagen' },
};

export function categoryLabel(imageType: string, locale: HermesLocale): string {
  return CATEGORY_LABELS[imageType]?.[locale] ?? imageType;
}

export const SUMMARIES: Record<HermesLocale, (categories: string[]) => string> = {
  es: (cats) =>
    `Las imágenes aportadas incluyen evidencias visuales relacionadas con: ${cats.join(', ')}. ` +
    `Los hallazgos que se describen a continuación son orientativos y se basan en la observación de los elementos visibles. ` +
    `Su valoración definitiva requeriría inspección técnica presencial.`,

  en: (cats) =>
    `The submitted images include visual evidence related to: ${cats.join(', ')}. ` +
    `The findings described below are indicative and based on observation of visible elements. ` +
    `A definitive assessment would require on-site technical inspection.`,

  de: (cats) =>
    `Die eingereichten Bilder enthalten visuelle Hinweise zu: ${cats.join(', ')}. ` +
    `Die nachfolgend beschriebenen Befunde sind orientierend und basieren auf der Beobachtung sichtbarer Elemente. ` +
    `Eine abschließende Bewertung erfordert eine technische Vor-Ort-Prüfung.`,
};

export const LIMITATIONS: Record<HermesLocale, string[]> = {
  es: [
    'El análisis visual no sustituye a una auditoría energética certificada.',
    'No es posible determinar materiales ocultos o características no visibles en fotografías.',
    'La calidad y el ángulo de las imágenes pueden afectar a la precisión de los hallazgos.',
  ],
  en: [
    'Visual analysis does not replace a certified energy audit.',
    'Hidden materials or characteristics not visible in photographs cannot be determined.',
    'Image quality and angle may affect the accuracy of findings.',
  ],
  de: [
    'Die visuelle Analyse ersetzt kein zertifiziertes Energiegutachten.',
    'Verborgene Materialien oder nicht sichtbare Merkmale können anhand von Fotos nicht ermittelt werden.',
    'Bildqualität und -winkel können die Genauigkeit der Befunde beeinflussen.',
  ],
};

export const RECOMMENDED_CHECKS: Record<HermesLocale, string[]> = {
  es: [
    'Verificar el tipo de vidrio y la estanqueidad de las carpinterías con un técnico.',
    'Comprobar el estado del aislamiento en cámara de aire o trasdosado si procede.',
    'Revisar la cubierta en busca de puentes térmicos o filtraciones.',
  ],
  en: [
    'Verify glazing type and frame airtightness with a specialist.',
    'Check insulation condition in cavity walls or internal linings where applicable.',
    'Inspect the roof for thermal bridges or water ingress.',
  ],
  de: [
    'Verglasung und Dichtheit der Rahmen mit einem Fachmann prüfen.',
    'Dämmzustand in Hohlräumen oder Innendämmungen ggf. überprüfen.',
    'Dach auf Wärmebrücken oder Feuchteeintritt inspizieren.',
  ],
};

export const DISCLAIMERS: Record<HermesLocale, string> = {
  es: 'Análisis visual orientativo generado a partir de las imágenes aportadas por el usuario. No constituye un certificado energético ni sustituye la valoración de un técnico competente.',
  en: 'Indicative visual analysis generated from user-submitted images. This does not constitute an energy certificate or replace the assessment of a qualified professional.',
  de: 'Orientierender visueller Befund auf Basis der vom Nutzer eingereichten Bilder. Kein Energieausweis, kein Ersatz für die Bewertung durch eine qualifizierte Fachkraft.',
};
