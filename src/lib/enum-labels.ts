import type { AppLanguage, PdfLanguage } from '@/lib/preferences';

// Centralized human-readable labels for persisted enum/string values.
// Internal values (house, flat, DRAFT, PENDING…) must not appear raw in the UI.

const propertyTypeLabels: Record<PdfLanguage, Record<string, string>> = {
  es: { flat: 'Piso / Apartamento', house: 'Casa unifamiliar', terraced: 'Adosado', penthouse: 'Ático', ground_floor: 'Planta baja', unknown: 'Tipo no indicado' },
  ca: { flat: 'Pis / Apartament', house: 'Casa unifamiliar', terraced: 'Adossat', penthouse: 'Àtic', ground_floor: 'Planta baixa', unknown: 'Tipus no indicat' },
  en: { flat: 'Flat / Apartment', house: 'Detached House', terraced: 'Terraced House', penthouse: 'Penthouse', ground_floor: 'Ground Floor', unknown: 'Type not specified' },
  de: { flat: 'Wohnung', house: 'Einfamilienhaus', terraced: 'Reihenhaus', penthouse: 'Penthouse', ground_floor: 'Erdgeschoss', unknown: 'Typ nicht angegeben' },
  fr: { flat: 'Appartement', house: 'Maison individuelle', terraced: 'Maison mitoyenne', penthouse: 'Penthouse', ground_floor: 'Rez-de-chaussée', unknown: 'Type non indiqué' },
  it: { flat: 'Appartamento', house: 'Casa unifamiliare', terraced: 'Casa a schiera', penthouse: 'Attico', ground_floor: 'Piano terra', unknown: 'Tipo non indicato' },
  pt: { flat: 'Apartamento', house: 'Moradia unifamiliar', terraced: 'Moradia em banda', penthouse: 'Cobertura', ground_floor: 'Rés-do-chão', unknown: 'Tipo não indicado' },
};

const assessmentPaymentStatusLabels: Record<PdfLanguage, Record<string, string>> = {
  es: { unpaid: 'Gratuito', paid: 'Premium', DRAFT: 'Borrador', pending: 'Pendiente' },
  ca: { unpaid: 'Gratuït', paid: 'Premium', DRAFT: 'Esborrany', pending: 'Pendent' },
  en: { unpaid: 'Free', paid: 'Premium', DRAFT: 'Draft', pending: 'Pending' },
  de: { unpaid: 'Kostenlos', paid: 'Premium', DRAFT: 'Entwurf', pending: 'Ausstehend' },
  fr: { unpaid: 'Gratuit', paid: 'Premium', DRAFT: 'Brouillon', pending: 'En attente' },
  it: { unpaid: 'Gratuito', paid: 'Premium', DRAFT: 'Bozza', pending: 'In attesa' },
  pt: { unpaid: 'Gratuito', paid: 'Premium', DRAFT: 'Rascunho', pending: 'Pendente' },
};

const budgetReviewStatusLabels: Record<PdfLanguage, Record<string, string>> = {
  es: { DRAFT: 'Borrador', ANALYZED: 'Analizado', PAID: 'Pagado', ERROR: 'Error en análisis' },
  ca: { DRAFT: 'Esborrany', ANALYZED: 'Analitzat', PAID: 'Pagat', ERROR: 'Error en anàlisi' },
  en: { DRAFT: 'Draft', ANALYZED: 'Analysed', PAID: 'Paid', ERROR: 'Analysis error' },
  de: { DRAFT: 'Entwurf', ANALYZED: 'Analysiert', PAID: 'Bezahlt', ERROR: 'Analysefehler' },
  fr: { DRAFT: 'Brouillon', ANALYZED: 'Analysé', PAID: 'Payé', ERROR: 'Erreur d\'analyse' },
  it: { DRAFT: 'Bozza', ANALYZED: 'Analizzato', PAID: 'Pagato', ERROR: 'Errore di analisi' },
  pt: { DRAFT: 'Rascunho', ANALYZED: 'Analisado', PAID: 'Pago', ERROR: 'Erro de análise' },
};

const providerStatusLabels: Record<PdfLanguage, Record<string, string>> = {
  es: { PENDING: 'Pendiente de verificación', VERIFIED: 'Verificado', PREFERRED: 'Preferente', SUSPENDED: 'Suspendido', EXCLUSIVE: 'Exclusivo' },
  ca: { PENDING: 'Pendent de verificació', VERIFIED: 'Verificat', PREFERRED: 'Preferent', SUSPENDED: 'Suspès', EXCLUSIVE: 'Exclusiu' },
  en: { PENDING: 'Pending verification', VERIFIED: 'Verified', PREFERRED: 'Preferred', SUSPENDED: 'Suspended', EXCLUSIVE: 'Exclusive' },
  de: { PENDING: 'Verifizierung ausstehend', VERIFIED: 'Verifiziert', PREFERRED: 'Bevorzugt', SUSPENDED: 'Gesperrt', EXCLUSIVE: 'Exklusiv' },
  fr: { PENDING: 'Vérification en attente', VERIFIED: 'Vérifié', PREFERRED: 'Préféré', SUSPENDED: 'Suspendu', EXCLUSIVE: 'Exclusif' },
  it: { PENDING: 'Verifica in attesa', VERIFIED: 'Verificato', PREFERRED: 'Preferito', SUSPENDED: 'Sospeso', EXCLUSIVE: 'Esclusivo' },
  pt: { PENDING: 'Verificação pendente', VERIFIED: 'Verificado', PREFERRED: 'Preferido', SUSPENDED: 'Suspenso', EXCLUSIVE: 'Exclusivo' },
};

const leadStatusLabels: Record<PdfLanguage, Record<string, string>> = {
  es: { PENDING: 'Pendiente', CONTACTED: 'Contactado', QUOTED: 'Presupuestado', WON: 'Ganado', LOST: 'Perdido', CANCELLED: 'Cancelado' },
  ca: { PENDING: 'Pendent', CONTACTED: 'Contactat', QUOTED: 'Pressupostat', WON: 'Guanyat', LOST: 'Perdut', CANCELLED: 'Cancel·lat' },
  en: { PENDING: 'Pending', CONTACTED: 'Contacted', QUOTED: 'Quoted', WON: 'Won', LOST: 'Lost', CANCELLED: 'Cancelled' },
  de: { PENDING: 'Ausstehend', CONTACTED: 'Kontaktiert', QUOTED: 'Angeboten', WON: 'Gewonnen', LOST: 'Verloren', CANCELLED: 'Abgebrochen' },
  fr: { PENDING: 'En attente', CONTACTED: 'Contacté', QUOTED: 'Devisé', WON: 'Gagné', LOST: 'Perdu', CANCELLED: 'Annulé' },
  it: { PENDING: 'In attesa', CONTACTED: 'Contattato', QUOTED: 'Preventivato', WON: 'Vinto', LOST: 'Perso', CANCELLED: 'Annullato' },
  pt: { PENDING: 'Pendente', CONTACTED: 'Contactado', QUOTED: 'Orçamentado', WON: 'Ganho', LOST: 'Perdido', CANCELLED: 'Cancelado' },
};

const professionalAccessStatusLabels: Record<PdfLanguage, Record<string, string>> = {
  es: { NONE: 'Sin solicitud', PENDING: 'Pendiente de revisión', APPROVED: 'Aprobado', REJECTED: 'No aprobado' },
  ca: { NONE: 'Sense sol·licitud', PENDING: 'Pendent de revisió', APPROVED: 'Aprovat', REJECTED: 'No aprovat' },
  en: { NONE: 'No request', PENDING: 'Under review', APPROVED: 'Approved', REJECTED: 'Not approved' },
  de: { NONE: 'Keine Anfrage', PENDING: 'In Prüfung', APPROVED: 'Genehmigt', REJECTED: 'Nicht genehmigt' },
  fr: { NONE: 'Aucune demande', PENDING: 'En cours de révision', APPROVED: 'Approuvé', REJECTED: 'Non approuvé' },
  it: { NONE: 'Nessuna richiesta', PENDING: 'In revisione', APPROVED: 'Approvato', REJECTED: 'Non approvato' },
  pt: { NONE: 'Sem pedido', PENDING: 'Em revisão', APPROVED: 'Aprovado', REJECTED: 'Não aprovado' },
};

const confidenceLevelLabels: Record<PdfLanguage, Record<string, string>> = {
  es: { high: 'Alta', medium: 'Media', low: 'Baja', unknown: 'Desconocida' },
  ca: { high: 'Alta', medium: 'Mitjana', low: 'Baixa', unknown: 'Desconeguda' },
  en: { high: 'High', medium: 'Medium', low: 'Low', unknown: 'Unknown' },
  de: { high: 'Hoch', medium: 'Mittel', low: 'Niedrig', unknown: 'Unbekannt' },
  fr: { high: 'Élevée', medium: 'Moyenne', low: 'Faible', unknown: 'Inconnue' },
  it: { high: 'Alta', medium: 'Media', low: 'Bassa', unknown: 'Sconosciuta' },
  pt: { high: 'Alta', medium: 'Média', low: 'Baixa', unknown: 'Desconhecida' },
};

function getLabel(
  map: Record<PdfLanguage, Record<string, string>>,
  lang: AppLanguage | PdfLanguage,
  value: string | null | undefined,
  nullFallback = '—',
): string {
  const langMap = (map[lang as PdfLanguage] ?? map.es) as Record<string, string>;
  if (value == null || value === '') return nullFallback;
  return langMap[value] ?? value;
}

export function getPropertyTypeLabel(value: string | null | undefined, lang: AppLanguage | PdfLanguage = 'es'): string {
  return getLabel(propertyTypeLabels, lang, value);
}

export function getAssessmentPaymentStatusLabel(value: string | null | undefined, lang: AppLanguage | PdfLanguage = 'es'): string {
  return getLabel(assessmentPaymentStatusLabels, lang, value, value ?? '—');
}

export function getBudgetReviewStatusLabel(value: string | null | undefined, lang: AppLanguage | PdfLanguage = 'es'): string {
  return getLabel(budgetReviewStatusLabels, lang, value, value ?? '—');
}

export function getProviderStatusLabel(value: string | null | undefined, lang: AppLanguage | PdfLanguage = 'es'): string {
  return getLabel(providerStatusLabels, lang, value, value ?? '—');
}

export function getLeadStatusLabel(value: string | null | undefined, lang: AppLanguage | PdfLanguage = 'es'): string {
  return getLabel(leadStatusLabels, lang, value, value ?? '—');
}

export function getProfessionalAccessStatusLabel(value: string | null | undefined, lang: AppLanguage | PdfLanguage = 'es'): string {
  return getLabel(professionalAccessStatusLabels, lang, value, value ?? '—');
}

export function getConfidenceLevelLabel(value: string | null | undefined, lang: AppLanguage | PdfLanguage = 'es'): string {
  return getLabel(confidenceLevelLabels, lang, value, '—');
}
