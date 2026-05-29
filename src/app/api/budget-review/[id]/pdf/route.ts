import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToStream } from '@react-pdf/renderer';
import { BudgetReviewReport } from '@/lib/pdf/BudgetReviewReport';
import { normalizeSelectedLocale, toPdfLanguage } from '@/lib/preferences';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import type { BudgetLineItem } from '@/lib/ingestion/types';
import type { KbPriceRef } from '@/lib/budget-review/advanced-analysis';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const review = await prisma.budgetReview.findUnique({ where: { id: params.id } });

  if (!review) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!review.paidAt) {
    return NextResponse.json({ error: 'payment_required', checkoutRequired: true }, { status: 402 });
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const cookieLang = cookieHeader.match(/enerscan-language=(es|ca|en|de|fr|it|pt)/)?.[1];
  const url = new URL(req.url);
  const pdfLanguage = toPdfLanguage(normalizeSelectedLocale(url.searchParams.get('lang') || cookieLang));
  const localeMap: Record<string, string> = { es: 'es-ES', ca: 'es-ES', en: 'en-GB', de: 'de-DE', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT' };
  const locale = localeMap[pdfLanguage] ?? 'es-ES';

  const lineItems = Array.isArray(review.lineItemsJson) ? review.lineItemsJson as BudgetLineItem[] : [];
  const summaryJson = review.summaryJson as { totalAmount?: number; confidence?: number } | null;
  const findingsJson = review.findingsJson as { kbPriceRefs?: KbPriceRef[] } | null;

  const reportData = {
    id: review.id,
    date: review.createdAt.toLocaleDateString(locale),
    fileName: review.fileName ?? undefined,
    totalAmount: summaryJson?.totalAmount ?? (review.totalAmountCents ? review.totalAmountCents / 100 : undefined),
    currency: review.currency || 'EUR',
    extractionConfidence: review.extractionConfidence ?? undefined,
    lineItems,
    language: pdfLanguage,
    kbPriceRefs: findingsJson?.kbPriceRefs,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await renderToStream(React.createElement(BudgetReviewReport, { data: reportData }) as any);
  const chunks: Uint8Array[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of stream as any) chunks.push(chunk);
  const pdfBytes = Buffer.concat(chunks);

  const t = getMonetizationCopy(pdfLanguage).budgetReview;
  const filename = `${t.pdfFilename}-${pdfLanguage}-${review.id.slice(0, 8)}.pdf`;

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
