import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { parseBudgetAnalysisText } from '@/lib/ocr/budget-parser';
import type { BudgetLineItem } from '@/lib/ingestion/types';
import { buildBudgetAdvancedAnalysis, detectBudgetCategory, type BudgetAdvancedAnalysis, type BudgetCategory, type KbPriceRef } from './advanced-analysis';
import type { AppLanguage } from '@/lib/preferences';
import { searchKnowledge } from '@/lib/knowledge/search';
import { extractZipFromText, zipToRegion } from '@/lib/knowledge/zip-to-region';

export function hashBudgetText(text: string) {
  return createHash('sha256').update(text).digest('hex');
}

export function buildBudgetReviewFindings(lineItems: BudgetLineItem[], totalAmount?: number) {
  const findings = lineItems.map((item) => {
    const unitPrice = item.unitPrice || (item.total && item.quantity ? item.total / item.quantity : undefined);
    const high = unitPrice !== undefined && unitPrice > 450;
    const low = unitPrice !== undefined && unitPrice < 25;
    return {
      description: item.description,
      total: item.total,
      unitPrice,
      status: high ? 'HIGH_REVIEW' : low ? 'LOW_REVIEW' : 'IN_RANGE',
      message: high
        ? 'Partida con precio unitario elevado. Conviene pedir desglose tecnico.'
        : low
          ? 'Partida con precio unitario bajo. Revisa alcance, calidades y mediciones.'
          : 'Partida dentro de un rango orientativo amplio.',
    };
  });

  return {
    findings,
    alert: totalAmount && totalAmount > 30000
      ? 'Presupuesto alto: revisa mediciones, exclusiones, IVA y garantías antes de aceptar.'
      : 'Revisa siempre mediciones, marcas, garantías e IVA antes de aceptar.',
    legalNotice: 'Análisis automático orientativo. No sustituye la revisión de un técnico, arquitecto, aparejador ni asesor legal.',
  };
}

export type CreateBudgetReviewResult = {
  review: Awaited<ReturnType<typeof prisma.budgetReview.create>>;
  advancedAnalysis: BudgetAdvancedAnalysis;
};

const CATEGORY_TO_KB_KEYWORDS: Record<BudgetCategory, string[]> = {
  windows: ['ventana', 'carpintería', 'window', 'fenster'],
  aerothermia: ['aerotermia', 'bomba de calor', 'heat pump', 'wärmepumpe'],
  insulation: ['aislamiento', 'SATE', 'insulation', 'dämmung'],
  photovoltaic: ['fotovoltaica', 'solar', 'paneles', 'photovoltaik'],
  full_renovation: ['reforma', 'rehabilitación', 'renovation', 'renovierung'],
  general: [],
};

export async function createBudgetReviewFromText(input: {
  text: string;
  source?: string;
  fileName?: string;
  userId?: string;
  lang?: AppLanguage;
}): Promise<CreateBudgetReviewResult> {
  const analysis = parseBudgetAnalysisText(input.text);
  const reviewFindings = buildBudgetReviewFindings(analysis.lineItems, analysis.totalAmount);
  const totalAmountCents = analysis.totalAmount ? Math.round(analysis.totalAmount * 100) : undefined;

  // Detect budget category early so we can query KB with meaningful keywords
  const descriptions = analysis.lineItems.map((i) => i.description).filter(Boolean) as string[];
  const budgetCategory = detectBudgetCategory(descriptions);

  // Derive CCAA region from first ZIP found in budget text for regional KB entries
  const zip = extractZipFromText(input.text);
  const region = zip ? zipToRegion(zip) : null;
  const keywords = CATEGORY_TO_KB_KEYWORDS[budgetCategory];

  // Search KB for price references matching detected category + region (non-blocking on error)
  const kbResults = await searchKnowledge({
    category: 'price_reference',
    region: region ?? undefined,
    includeNational: true,
    keywords: keywords.length ? keywords : undefined,
    limit: 5,
  }).catch(() => []);

  const kbPriceRefs: KbPriceRef[] = kbResults.map((r) => ({
    title: r.title,
    content: r.content,
    sourceUrl: r.sourceUrl,
    sourceLabel: r.sourceLabel,
    region: r.region,
  }));

  const advancedAnalysis = buildBudgetAdvancedAnalysis(
    analysis.lineItems,
    analysis.totalAmount,
    input.lang ?? 'es',
    kbPriceRefs.length ? kbPriceRefs : undefined,
  );

  const review = await prisma.budgetReview.create({
    data: {
      userId: input.userId,
      source: input.source || 'text',
      fileName: input.fileName,
      rawTextHash: hashBudgetText(input.text),
      status: 'ANALYZED',
      extractionConfidence: analysis.extractionConfidence,
      totalAmountCents,
      currency: analysis.currency || 'EUR',
      summaryJson: {
        detectedItems: analysis.lineItems.length,
        detectedMeasures: analysis.detectedMeasures.length,
        totalAmount: analysis.totalAmount,
        confidence: analysis.extractionConfidence,
        alert: reviewFindings.alert,
      },
      lineItemsJson: analysis.lineItems,
      findingsJson: { ...reviewFindings, kbPriceRefs: kbPriceRefs.length ? kbPriceRefs : undefined },
    },
  });

  return { review, advancedAnalysis };
}
