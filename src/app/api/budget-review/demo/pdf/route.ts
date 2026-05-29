import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { BudgetReviewReport } from '@/lib/pdf/BudgetReviewReport';
import { normalizeLanguage, normalizeSelectedLocale, toPdfLanguage } from '@/lib/preferences';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import React from 'react';

export const dynamic = 'force-dynamic';

// Localized demo line items descriptions
const demoBudgetDescriptions: Record<string, string[]> = {
  es: ['Sustitución de ventanas PVC doble acristalamiento', 'Aislamiento fachada SATE 8cm', 'Bomba de calor aerotérmica 12kW', 'Instalación fotovoltaica 4kWp', 'Ventilación mecánica controlada VMC'],
  ca: ['Substitució de finestres PVC doble vidre', 'Aïllament façana SATE 8cm', 'Bomba de calor aerotèrmica 12kW', 'Instal·lació fotovoltaica 4kWp', 'Ventilació mecànica controlada VMC'],
  en: ['PVC double-glazed window replacement', 'ETICS facade insulation 8cm', 'Air-to-water heat pump 12kW', 'Photovoltaic installation 4kWp', 'Controlled mechanical ventilation'],
  de: ['PVC-Fensteraustausch Doppelverglasung', 'WDVS-Fassadendämmung 8cm', 'Luft-Wasser-Wärmepumpe 12kW', 'Photovoltaikanlage 4kWp', 'Kontrollierte Wohnungslüftung'],
  fr: ['Remplacement fenêtres PVC double vitrage', 'Isolation façade ITE 8cm', 'Pompe à chaleur aérothermique 12kW', 'Installation photovoltaïque 4kWp', 'Ventilation mécanique contrôlée'],
  it: ['Sostituzione finestre PVC doppio vetro', 'Isolamento facciata ETICS 8cm', 'Pompa di calore aerotérmica 12kW', 'Impianto fotovoltaico 4kWp', 'Ventilazione meccanica controllata'],
  pt: ['Substituição janelas PVC vidro duplo', 'Isolamento fachada ETICS 8cm', 'Bomba de calor aerotérmica 12kW', 'Instalação fotovoltaica 4kWp', 'Ventilação mecânica controlada'],
};

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookieLang = cookieHeader.match(/enerscan-language=(es|ca|en|de|fr|it|pt)/)?.[1];
  const url = new URL(req.url);
  const pdfLanguage = toPdfLanguage(normalizeSelectedLocale(url.searchParams.get('lang') || cookieLang));
  const language = normalizeLanguage(pdfLanguage);
  const localeMap: Record<string, string> = { es: 'es-ES', ca: 'es-ES', en: 'en-GB', de: 'de-DE', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT' };
  const locale = localeMap[pdfLanguage] ?? 'es-ES';

  const descriptions = demoBudgetDescriptions[pdfLanguage] ?? demoBudgetDescriptions.es;

  const lineItems = [
    { description: descriptions[0], quantity: 12, unit: 'm²', unitPrice: 380, total: 4560 },
    { description: descriptions[1], quantity: 85, unit: 'm²', unitPrice: 95, total: 8075 },
    { description: descriptions[2], quantity: 1, unit: 'ud', unitPrice: 9200, total: 9200 },
    { description: descriptions[3], quantity: 1, unit: 'ud', unitPrice: 6800, total: 6800 },
    { description: descriptions[4], quantity: 1, unit: 'ud', unitPrice: 3200, total: 3200 },
  ];

  const reportData = {
    id: 'demo-budget-review',
    date: new Date().toLocaleDateString(locale),
    fileName: `budget-review-demo.pdf`,
    totalAmount: lineItems.reduce((sum, i) => sum + (i.total ?? 0), 0),
    currency: 'EUR',
    extractionConfidence: 0.82,
    lineItems,
    language: pdfLanguage,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await renderToStream(React.createElement(BudgetReviewReport, { data: reportData }) as any);
  const chunks: Uint8Array[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of stream as any) chunks.push(chunk);
  const pdfBytes = Buffer.concat(chunks);

  const t = getMonetizationCopy(language).budgetReview;
  const filename = `${t.pdfFilename}-demo-${pdfLanguage}.pdf`;

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
