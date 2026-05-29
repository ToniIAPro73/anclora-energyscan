import fs from "fs";
import path from "path";
import { calculateScoreV2 } from "./scoring";
import { AssessmentAttachment, EnergyLetter, PropertyDataV2 } from "./domain/energy-assessment";

export type DemoAttachmentCategory = "EXTERIOR" | "INTERIOR" | "CEE";

export interface DemoAttachment extends AssessmentAttachment {
  path: string;
  category: DemoAttachmentCategory;
  caption: string;
  ceeLetter?: EnergyLetter;
}

const DEMO_ASSET_BASE = "demo-assets/property-demo";

export const demoProperty: PropertyDataV2 = {
  objective: "sale_rent",
  propertyType: "house",
  year: 1998,
  area: 185,
  zipcode: "07141",
  orientation: "south",
  roofType: "pitched",
  heating: "gas",
  cooling: "split",
  waterHeating: "gas",
  ventilation: "natural",
  windows: "double",
  renewables: "none",
  facadeInsulation: "partial",
  roofInsulation: "good",
  budgetRange: "medium",
  timelineHorizon: "one_year",
  targetLetter: "C",
};

export const demoCertificate = {
  id: "cee-demo",
  fileName: "cee-demo-anclora-energyscan-vivienda-07141.pdf",
  letter: calculateScoreV2(demoProperty).estimatedLetter,
  title: "Certificado de Eficiencia Energetica - Documento demo",
  summary: "Supuesto CEE aportado por el usuario. Documento demo sin validez oficial ni administrativa.",
};

export const demoPublicRef = "DEMO-EZNFOIFQ";

function assetPath(fileName: string): string {
  return `${DEMO_ASSET_BASE}/${fileName}`;
}

function assetSize(fileName: string): number {
  try {
    return fs.statSync(getDemoAssetPathByFileName(fileName)).size;
  } catch {
    return 0;
  }
}

export const demoAttachments: DemoAttachment[] = [
  {
    id: "demo-cee",
    name: demoCertificate.fileName,
    type: "application/pdf",
    size: assetSize(demoCertificate.fileName),
    path: assetPath(demoCertificate.fileName),
    category: "CEE",
    caption: "Certificado energético demo aportado por el usuario",
    ceeLetter: demoCertificate.letter,
  },
  {
    id: "demo-exterior-01-fachada",
    name: "exterior-01.png",
    type: "image/png",
    size: assetSize("exterior-01.png"),
    path: assetPath("exterior-01.png"),
    category: "EXTERIOR",
    caption: "Fachada principal",
  },
  {
    id: "demo-exterior-02-lateral",
    name: "exterior-02.png",
    type: "image/png",
    size: assetSize("exterior-02.png"),
    path: assetPath("exterior-02.png"),
    category: "EXTERIOR",
    caption: "Vista exterior lateral",
  },
  {
    id: "demo-interior-07-distribuidor",
    name: "interior-07.png",
    type: "image/png",
    size: assetSize("interior-07.png"),
    path: assetPath("interior-07.png"),
    category: "INTERIOR",
    caption: "Distribuidor de planta superior",
  },
  {
    id: "demo-interior-06-bano-suite",
    name: "interior-06.png",
    type: "image/png",
    size: assetSize("interior-06.png"),
    path: assetPath("interior-06.png"),
    category: "INTERIOR",
    caption: "Baño principal / baño en suite",
  },
  {
    id: "demo-interior-05-dormitorio",
    name: "interior-05.png",
    type: "image/png",
    size: assetSize("interior-05.png"),
    path: assetPath("interior-05.png"),
    category: "INTERIOR",
    caption: "Dormitorio principal",
  },
  {
    id: "demo-interior-04-acceso-escalera",
    name: "interior-04.png",
    type: "image/png",
    size: assetSize("interior-04.png"),
    path: assetPath("interior-04.png"),
    category: "INTERIOR",
    caption: "Acceso y escalera interior",
  },
  {
    id: "demo-interior-02-cocina",
    name: "interior-02.png",
    type: "image/png",
    size: assetSize("interior-02.png"),
    path: assetPath("interior-02.png"),
    category: "INTERIOR",
    caption: "Cocina",
  },
  {
    id: "demo-interior-01-salon",
    name: "interior-01.png",
    type: "image/png",
    size: assetSize("interior-01.png"),
    path: assetPath("interior-01.png"),
    category: "INTERIOR",
    caption: "Salón principal",
  },
  {
    id: "demo-exterior-03-piscina",
    name: "exterior-03.png",
    type: "image/png",
    size: assetSize("exterior-03.png"),
    path: assetPath("exterior-03.png"),
    category: "EXTERIOR",
    caption: "Vista exterior posterior con piscina",
  },
];

const demoCaptionsByLocale: Record<string, Record<string, string>> = {
  ca: {
    'demo-cee': 'Certificat energètic demo aportat per l\'usuari',
    'demo-exterior-01-fachada': 'Façana principal',
    'demo-exterior-02-lateral': 'Vista exterior lateral',
    'demo-interior-07-distribuidor': 'Distribuïdor de planta superior',
    'demo-interior-06-bano-suite': 'Bany principal / bany en suite',
    'demo-interior-05-dormitorio': 'Dormitori principal',
    'demo-interior-04-acceso-escalera': 'Accés i escala interior',
    'demo-interior-02-cocina': 'Cuina',
    'demo-interior-01-salon': 'Saló principal',
    'demo-exterior-03-piscina': 'Vista exterior posterior amb piscina',
  },
  en: {
    'demo-cee': 'Demo energy certificate provided by user',
    'demo-exterior-01-fachada': 'Main facade',
    'demo-exterior-02-lateral': 'Lateral exterior view',
    'demo-interior-07-distribuidor': 'Upper floor hallway',
    'demo-interior-06-bano-suite': 'Master bathroom / en-suite',
    'demo-interior-05-dormitorio': 'Master bedroom',
    'demo-interior-04-acceso-escalera': 'Interior access and staircase',
    'demo-interior-02-cocina': 'Kitchen',
    'demo-interior-01-salon': 'Main living room',
    'demo-exterior-03-piscina': 'Rear exterior view with pool',
  },
  de: {
    'demo-cee': 'Demo-Energieausweis vom Nutzer bereitgestellt',
    'demo-exterior-01-fachada': 'Hauptfassade',
    'demo-exterior-02-lateral': 'Seitliche Außenansicht',
    'demo-interior-07-distribuidor': 'Flur im Obergeschoss',
    'demo-interior-06-bano-suite': 'Hauptbad / En-Suite-Bad',
    'demo-interior-05-dormitorio': 'Hauptschlafzimmer',
    'demo-interior-04-acceso-escalera': 'Eingang und Innentreppe',
    'demo-interior-02-cocina': 'Küche',
    'demo-interior-01-salon': 'Hauptwohnraum',
    'demo-exterior-03-piscina': 'Rückwärtige Außenansicht mit Pool',
  },
  fr: {
    'demo-cee': 'Certificat énergétique démo fourni par l\'utilisateur',
    'demo-exterior-01-fachada': 'Façade principale',
    'demo-exterior-02-lateral': 'Vue extérieure latérale',
    'demo-interior-07-distribuidor': 'Couloir de l\'étage supérieur',
    'demo-interior-06-bano-suite': 'Salle de bain principale / en suite',
    'demo-interior-05-dormitorio': 'Chambre principale',
    'demo-interior-04-acceso-escalera': 'Accès et escalier intérieur',
    'demo-interior-02-cocina': 'Cuisine',
    'demo-interior-01-salon': 'Salon principal',
    'demo-exterior-03-piscina': 'Vue extérieure arrière avec piscine',
  },
  it: {
    'demo-cee': 'Attestato di prestazione energetica demo fornito dall\'utente',
    'demo-exterior-01-fachada': 'Facciata principale',
    'demo-exterior-02-lateral': 'Vista esterna laterale',
    'demo-interior-07-distribuidor': 'Corridoio piano superiore',
    'demo-interior-06-bano-suite': 'Bagno principale / en suite',
    'demo-interior-05-dormitorio': 'Camera da letto principale',
    'demo-interior-04-acceso-escalera': 'Accesso e scala interna',
    'demo-interior-02-cocina': 'Cucina',
    'demo-interior-01-salon': 'Soggiorno principale',
    'demo-exterior-03-piscina': 'Vista esterna posteriore con piscina',
  },
  pt: {
    'demo-cee': 'Certificado de desempenho energético demo fornecido pelo utilizador',
    'demo-exterior-01-fachada': 'Fachada principal',
    'demo-exterior-02-lateral': 'Vista exterior lateral',
    'demo-interior-07-distribuidor': 'Hall do piso superior',
    'demo-interior-06-bano-suite': 'Casa de banho principal / en suite',
    'demo-interior-05-dormitorio': 'Quarto principal',
    'demo-interior-04-acceso-escalera': 'Acesso e escada interior',
    'demo-interior-02-cocina': 'Cozinha',
    'demo-interior-01-salon': 'Sala de estar principal',
    'demo-exterior-03-piscina': 'Vista exterior traseira com piscina',
  },
};

export function getLocalizedDemoAttachments(locale?: string): DemoAttachment[] {
  const lang = locale && demoCaptionsByLocale[locale] ? locale : null;
  if (!lang) return demoAttachments;
  const captions = demoCaptionsByLocale[lang];
  return demoAttachments.map((a) => ({
    ...a,
    caption: captions[a.id] ?? a.caption,
  }));
}

export function getDemoAttachmentById(id: string): DemoAttachment | undefined {
  return demoAttachments.find((attachment) => attachment.id === id);
}

export function getDemoAssetPath(id: string): string | undefined {
  const attachment = getDemoAttachmentById(id);
  if (!attachment) return undefined;
  return path.join(process.cwd(), "public", attachment.path);
}

export function getDemoAssetPathByFileName(fileName: string): string {
  return path.join(process.cwd(), "public", DEMO_ASSET_BASE, fileName);
}

export function getDemoAssessmentPayload(locale?: string) {
  return {
    propertyData: demoProperty,
    attachments: locale ? getLocalizedDemoAttachments(locale) : demoAttachments,
    isDemo: true,
    publicRef: demoPublicRef,
  };
}
