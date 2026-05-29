import type { HermesLocale } from './types';

// Human-readable labels for image types per locale
const CATEGORY_LABELS: Record<string, Record<HermesLocale, string>> = {
  facade:        { es: 'Fachada y envolvente',           ca: 'Façana i envolupant',               en: 'Facade & building envelope', de: 'Fassade & Gebäudehülle',      fr: 'Façade et enveloppe',               it: 'Facciata e involucro',           pt: 'Fachada e envolvente' },
  windows:       { es: 'Carpinterías y acristalamiento', ca: 'Fusteries i acristalament',         en: 'Windows & glazing',          de: 'Fenster & Verglasung',         fr: 'Menuiseries et vitrages',           it: 'Infissi e vetrate',              pt: 'Caixilharias e envidraçados' },
  roof:          { es: 'Cubierta y tejado',              ca: 'Coberta i teulada',                 en: 'Roof',                       de: 'Dach',                         fr: 'Toiture',                           it: 'Copertura e tetto',              pt: 'Cobertura e telhado' },
  heating:       { es: 'Sistema de calefacción/ACS',     ca: 'Sistema de calefacció/ACS',         en: 'Heating & hot water',        de: 'Heizung & Warmwasser',         fr: 'Chauffage et eau chaude',           it: 'Riscaldamento e ACS',            pt: 'Aquecimento e AQS' },
  insulation:    { es: 'Aislamiento térmico',            ca: 'Aïllament tèrmic',                  en: 'Thermal insulation',         de: 'Wärmedämmung',                 fr: 'Isolation thermique',               it: 'Isolamento termico',             pt: 'Isolamento térmico' },
  interior:      { es: 'Espacios interiores',            ca: 'Espais interiors',                  en: 'Interior spaces',            de: 'Innenräume',                   fr: 'Espaces intérieurs',                it: 'Spazi interni',                  pt: 'Espaços interiores' },
  documentation: { es: 'Documentación aportada',        ca: 'Documentació aportada',             en: 'Submitted documentation',    de: 'Eingereichte Unterlagen',      fr: 'Documentation fournie',             it: 'Documentazione fornita',         pt: 'Documentação fornecida' },
};

export function categoryLabel(imageType: string, locale: HermesLocale): string {
  return CATEGORY_LABELS[imageType]?.[locale] ?? imageType;
}

export const SUMMARIES: Record<HermesLocale, (categories: string[]) => string> = {
  es: (cats) =>
    `Las imágenes aportadas incluyen evidencias visuales relacionadas con: ${cats.join(', ')}. ` +
    `Los hallazgos que se describen a continuación son orientativos y se basan en la observación de los elementos visibles. ` +
    `Su valoración definitiva requeriría inspección técnica presencial.`,
  ca: (cats) =>
    `Les imatges aportades inclouen evidències visuals relacionades amb: ${cats.join(', ')}. ` +
    `Les troballes que es descriuen a continuació són orientatives i es basen en l'observació dels elements visibles. ` +
    `La seva valoració definitiva requeriria inspecció tècnica presencial.`,
  en: (cats) =>
    `The submitted images include visual evidence related to: ${cats.join(', ')}. ` +
    `The findings described below are indicative and based on observation of visible elements. ` +
    `A definitive assessment would require on-site technical inspection.`,
  de: (cats) =>
    `Die eingereichten Bilder enthalten visuelle Hinweise zu: ${cats.join(', ')}. ` +
    `Die nachfolgend beschriebenen Befunde sind orientierend und basieren auf der Beobachtung sichtbarer Elemente. ` +
    `Eine abschließende Bewertung erfordert eine technische Vor-Ort-Prüfung.`,
  fr: (cats) =>
    `Les images soumises incluent des preuves visuelles liées à : ${cats.join(', ')}. ` +
    `Les observations décrites ci-dessous sont indicatives et basées sur l'observation des éléments visibles. ` +
    `Une évaluation définitive nécessiterait une inspection technique sur site.`,
  it: (cats) =>
    `Le immagini inviate includono prove visive relative a: ${cats.join(', ')}. ` +
    `Le osservazioni descritte di seguito sono indicative e basate sull'osservazione degli elementi visibili. ` +
    `Una valutazione definitiva richiederebbe un'ispezione tecnica in loco.`,
  pt: (cats) =>
    `As imagens fornecidas incluem evidências visuais relacionadas com: ${cats.join(', ')}. ` +
    `As conclusões descritas abaixo são indicativas e baseadas na observação dos elementos visíveis. ` +
    `A sua avaliação definitiva exigiria uma inspeção técnica presencial.`,
};

export const LIMITATIONS: Record<HermesLocale, string[]> = {
  es: ['El análisis visual no sustituye a una auditoría energética certificada.', 'No es posible determinar materiales ocultos o características no visibles en fotografías.', 'La calidad y el ángulo de las imágenes pueden afectar a la precisión de los hallazgos.'],
  ca: ['L\'anàlisi visual no substitueix una auditoria energètica certificada.', 'No és possible determinar materials ocults o característiques no visibles en fotografies.', 'La qualitat i l\'angle de les imatges poden afectar la precisió de les troballes.'],
  en: ['Visual analysis does not replace a certified energy audit.', 'Hidden materials or characteristics not visible in photographs cannot be determined.', 'Image quality and angle may affect the accuracy of findings.'],
  de: ['Die visuelle Analyse ersetzt kein zertifiziertes Energiegutachten.', 'Verborgene Materialien oder nicht sichtbare Merkmale können anhand von Fotos nicht ermittelt werden.', 'Bildqualität und -winkel können die Genauigkeit der Befunde beeinflussen.'],
  fr: ['L\'analyse visuelle ne remplace pas un audit énergétique certifié.', 'Les matériaux cachés ou les caractéristiques non visibles sur les photographies ne peuvent pas être déterminés.', 'La qualité et l\'angle des images peuvent affecter la précision des observations.'],
  it: ['L\'analisi visiva non sostituisce un audit energetico certificato.', 'I materiali nascosti o le caratteristiche non visibili nelle fotografie non possono essere determinati.', 'La qualità e l\'angolo delle immagini possono influenzare la precisione delle osservazioni.'],
  pt: ['A análise visual não substitui uma auditoria energética certificada.', 'Os materiais ocultos ou características não visíveis nas fotografias não podem ser determinados.', 'A qualidade e o ângulo das imagens podem afetar a precisão das conclusões.'],
};

export const RECOMMENDED_CHECKS: Record<HermesLocale, string[]> = {
  es: ['Verificar el tipo de vidrio y la estanqueidad de las carpinterías con un técnico.', 'Comprobar el estado del aislamiento en cámara de aire o trasdosado si procede.', 'Revisar la cubierta en busca de puentes térmicos o filtraciones.'],
  ca: ['Verificar el tipus de vidre i l\'estanqueïtat de les fusteries amb un tècnic.', 'Comprovar l\'estat de l\'aïllament en cambra d\'aire o trasdossat si escau.', 'Revisar la coberta en busca de ponts tèrmics o filtracions.'],
  en: ['Verify glazing type and frame airtightness with a specialist.', 'Check insulation condition in cavity walls or internal linings where applicable.', 'Inspect the roof for thermal bridges or water ingress.'],
  de: ['Verglasung und Dichtheit der Rahmen mit einem Fachmann prüfen.', 'Dämmzustand in Hohlräumen oder Innendämmungen ggf. überprüfen.', 'Dach auf Wärmebrücken oder Feuchteeintritt inspizieren.'],
  fr: ['Vérifier le type de vitrage et l\'étanchéité des menuiseries avec un spécialiste.', 'Vérifier l\'état de l\'isolation dans les murs creux ou les doublages intérieurs le cas échéant.', 'Inspecter la toiture pour détecter les ponts thermiques ou les infiltrations d\'eau.'],
  it: ['Verificare il tipo di vetro e la tenuta degli infissi con uno specialista.', 'Controllare le condizioni dell\'isolamento nelle pareti cave o nei rivestimenti interni dove applicabile.', 'Ispezionare il tetto per ponti termici o infiltrazioni d\'acqua.'],
  pt: ['Verificar o tipo de vidro e a estanqueidade das caixilharias com um especialista.', 'Verificar o estado do isolamento em paredes duplas ou revestimentos interiores quando aplicável.', 'Inspecionar a cobertura para pontes térmicas ou infiltrações de água.'],
};

export const DISCLAIMERS: Record<HermesLocale, string> = {
  es: 'Análisis visual orientativo generado a partir de las imágenes aportadas por el usuario. No constituye un certificado energético ni sustituye la valoración de un técnico competente.',
  ca: 'Anàlisi visual orientatiu generat a partir de les imatges aportades per l\'usuari. No constitueix un certificat energètic ni substitueix la valoració d\'un tècnic competent.',
  en: 'Indicative visual analysis generated from user-submitted images. This does not constitute an energy certificate or replace the assessment of a qualified professional.',
  de: 'Orientierender visueller Befund auf Basis der vom Nutzer eingereichten Bilder. Kein Energieausweis, kein Ersatz für die Bewertung durch eine qualifizierte Fachkraft.',
  fr: 'Analyse visuelle indicative générée à partir des images soumises par l\'utilisateur. Cela ne constitue pas un certificat énergétique ni ne remplace l\'évaluation d\'un professionnel qualifié.',
  it: 'Analisi visiva indicativa generata dalle immagini inviate dall\'utente. Non costituisce un certificato energetico né sostituisce la valutazione di un professionista qualificato.',
  pt: 'Análise visual indicativa gerada a partir das imagens fornecidas pelo utilizador. Não constitui um certificado energético nem substitui a avaliação de um técnico qualificado.',
};
